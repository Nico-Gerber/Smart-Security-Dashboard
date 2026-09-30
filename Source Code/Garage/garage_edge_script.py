from flask import Flask, request, Response
import paho.mqtt.client as mqtt
import json
import threading
import uuid

app = Flask(__name__)


# MQTT

MQTT_HOST = "l69c6c62.ala.asia-southeast1.emqxsl.com"
MQTT_PORT = 8883

MQTT_USER = "smart_home_team"   
MQTT_PASS = "smarthome"

STATUS_TOPIC = "home/garage/status"
COMMAND_TOPIC = "home/garage/command"


lock = threading.Lock()

state = {
    "door_open": False,
    "armed": False,
    "alarm": False,
    "buzzer": False,
}


door_known = False


def publish_status():
    with lock:
        payload = {
            "zone": "garage",
            "status": "open" if state["door_open"] else "closed",
            "armed": state["armed"],
            "alarm": state["alarm"],
            "buzzer": state["buzzer"],
        }

    
    client.publish(STATUS_TOPIC, json.dumps(payload), qos=1, retain=True)
    print("Published:", payload)


def update_door(door_open):
    
    global door_known

    with lock:
        if not door_known:
            door_known = True
            state["door_open"] = door_open
            print("Garage door (initial):", "OPEN" if door_open else "CLOSED")
            return True

        was_open = state["door_open"]
        if door_open == was_open:
            return False

        state["door_open"] = door_open
        print("Garage door:", "OPEN" if door_open else "CLOSED")

        if door_open and state["armed"]:
            # Only trigger on the closed -> open transition
            state["alarm"] = True
            state["buzzer"] = True
        elif not door_open:
            state["alarm"] = False
            state["buzzer"] = False

    return True



def on_connect(client, userdata, flags, rc):
    print("MQTT connected:", rc)
    if rc != 0:
        return
    # Subscribing here means we re-subscribe after every reconnect
    client.subscribe(COMMAND_TOPIC, qos=1)
    print("Subscribed to:", COMMAND_TOPIC)
    publish_status()


def on_disconnect(client, userdata, rc):
    print("MQTT disconnected:", rc, "(will retry automatically)")


def on_message(client, userdata, message):
    command = message.payload.decode(errors="ignore").strip().upper()
    print("MQTT command:", command)

    with lock:
        if command == "ARM":
            state["armed"] = True
            
            if state["door_open"]:
                state["alarm"] = True
                state["buzzer"] = True

        elif command == "DISARM":
            state["armed"] = False
            state["alarm"] = False
            state["buzzer"] = False

        elif command == "SILENCE":
           
            state["buzzer"] = False

        else:
            print("Unknown command:", command)
            return

    publish_status()



@app.post("/sensor")
def sensor():
    data = request.get_json(silent=True)
    if not data or "reed" not in data:
        print("Bad /sensor body:", request.data)
        return "bad request", 400

    # INPUT_PULLUP: 1 = open, 0 = closed
    if update_door(data["reed"] == 1):
        publish_status()
    return "OK"



@app.get("/state")
def get_state():
    reed = request.args.get("reed", type=int)
    if reed in (0, 1) and update_door(reed == 1):
        publish_status()  # only on change, not every poll

    with lock:
        body = f"{int(state['armed'])},{int(state['buzzer'])}"
    return Response(body, mimetype="text/plain")



# Unique client ID so teammates running this script don't kick each other off
client = mqtt.Client(client_id=f"garage-edge-{uuid.uuid4().hex[:6]}")
client.username_pw_set(MQTT_USER, MQTT_PASS)
client.tls_set()
client.reconnect_delay_set(min_delay=1, max_delay=30)

client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message


client.connect_async(MQTT_HOST, MQTT_PORT)
client.loop_start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5010, threaded=True)