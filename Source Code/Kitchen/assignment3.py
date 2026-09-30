import serial
import time
import paho.mqtt.client as mqtt
import json

# --- Serial setup ---
DEVICE = '/dev/ttyACM0'
BAUD = 9600

arduino = serial.Serial(DEVICE, BAUD, timeout=1)
time.sleep(2)

# --- MQTT setup ---
MQTT_HOST = "l69c6c62.ala.asia-southeast1.emqxsl.com"
MQTT_PORT = 8883
MQTT_USERNAME = "smart_home_team"
MQTT_PASSWORD = "smarthome"

TEMP_READING_TOPIC = "home/temperature/status"        # Pi publishes here
THRESHOLD_TOPIC = "home/temperature/command"         # Pi subscribes
GARAGE_COMMAND_TOPIC = "home/garage/command"    # Pi subscribes
WINDOW_COMMAND_TOPIC = "home/window/command"    # Pi subscribes
FRONTDOOR_COMMAND_TOPIC = "home/frontdoor/command"  # Pi subscribes

# --- Change-threshold state ---
last_published_temp = None
CHANGE_THRESHOLD = 1.5  # degrees C


def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected to MQTT broker, reason code: {reason_code}")
    client.subscribe(THRESHOLD_TOPIC)
    client.subscribe(GARAGE_COMMAND_TOPIC)
    client.subscribe(WINDOW_COMMAND_TOPIC)
    client.subscribe(FRONTDOOR_COMMAND_TOPIC)


def on_message(client, userdata, msg):
    payload = msg.payload.decode().strip()
    print(f"Received on {msg.topic}: {payload}")

    if msg.topic == THRESHOLD_TOPIC:
        # expecting something like "HIGH 30" or "LOW 18"
        labeled_command = f"[TEMP] {payload}"

    elif msg.topic == GARAGE_COMMAND_TOPIC:
        label = "Silence" if payload == "silence" else payload
        labeled_command = f"[GARAGE] {label}"

    elif msg.topic == WINDOW_COMMAND_TOPIC:
        labeled_command = f"[WINDOW] {payload}"

    elif msg.topic == FRONTDOOR_COMMAND_TOPIC:
        labeled_command = f"[DOOR] {payload}"

    else:
        # unrecognized topic — log it but don't send anything malformed to the Arduino
        print(f"Unhandled topic: {msg.topic}")
        return

    arduino.write((labeled_command + "\n").encode('utf-8'))


mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqtt_client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
mqtt_client.tls_set()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

mqtt_client.connect(MQTT_HOST, MQTT_PORT)
mqtt_client.loop_start()


def handle_temperature_reading(current_temp):
    global last_published_temp

    if last_published_temp is None or abs(current_temp - last_published_temp) >= CHANGE_THRESHOLD:
        payload = json.dumps({
            "temperature": current_temp
        })
        mqtt_client.publish(TEMP_READING_TOPIC, payload)
        last_published_temp = current_temp
        print(f"Published new temp: {payload}")


# --- Main loop: read Arduino, apply threshold, publish ---
while True:
    line = arduino.readline().decode('utf-8', errors='ignore').strip()

    if not line:
        continue

    try:
        current_temp = float(line)
    except ValueError:
        continue

    handle_temperature_reading(current_temp)

    time.sleep(0.1)