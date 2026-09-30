
"""
Front door zone bridge script
Runs on Raspbian Edge VM.

Connects to TWO separate MQTT destinations:
  1. EMQX Cloud (shared team broker) - for team communication / website control
  2. ThingsBoard (running on the host Windows machine) - for cloud data
     collection and visualisation (dashboard, history)

Install dependencies first:
    pip3 install paho-mqtt pyserial
"""

import json
import serial
import time
import paho.mqtt.client as mqtt

# ---- EMQX Cloud (team broker) ----
EMQX_HOST = "l69c6c62.ala.asia-southeast1.emqxsl.com"
EMQX_PORT = 8883  # TLS port
EMQX_USERNAME = "smart_home_team"
EMQX_PASSWORD = "smarthome"
STATUS_TOPIC = "home/frontdoor/status"
COMMAND_TOPIC = "home/frontdoor/command"

# ---- ThingsBoard (host machine, cloud platform / visualisation) ----
TB_HOST = "192.168.1.108"          # your Windows host's Wi-Fi IP
TB_PORT = 1883                      # plain MQTT, no TLS, LAN only
TB_ACCESS_TOKEN = "pUKCCM8Mvu4iktsfLoBM"  # FrontDoor device's access token
TB_TELEMETRY_TOPIC = "v1/devices/me/telemetry"

# ---- Current state for this zone (updated as Arduino reports changes) ----
zone_state = {
    "status": "closed",
    "armed": False,
    "locked": False
}


def update_state_from_line(line):
    """Update zone_state based on an Arduino serial line. Returns True if changed."""
    changed = False

    if line == "STATUS:OPEN" and zone_state["status"] != "open":
        zone_state["status"] = "open"
        changed = True
    elif line == "STATUS:CLOSED" and zone_state["status"] != "closed":
        zone_state["status"] = "closed"
        changed = True
    elif line == "STATUS:ARMED" and zone_state["armed"] != True:
        zone_state["armed"] = True
        changed = True
    elif line == "STATUS:DISARMED" and zone_state["armed"] != False:
        zone_state["armed"] = False
        changed = True
    elif line == "STATUS:LOCKED" and zone_state["locked"] != True:
        zone_state["locked"] = True
        changed = True
    elif line == "STATUS:UNLOCKED" and zone_state["locked"] != False:
        zone_state["locked"] = False
        changed = True
    elif line == "ALERT:DOOR_OPENED_WHILE_ARMED":
        changed = True  # always republish on an alert, even if status unchanged

    return changed


# ---- Serial port to your Arduino ----
SERIAL_PORT = "/dev/ttyACM0"
BAUD_RATE = 9600


def on_connect_emqx(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("[EMQX] Connected to MQTT broker.")
        client.subscribe(COMMAND_TOPIC)
        print(f"[EMQX] Subscribed to {COMMAND_TOPIC}")
    else:
        print(f"[EMQX] Connection failed with code {rc}")


def on_message_emqx(client, userdata, msg):
    command = msg.payload.decode().strip()
    print(f"[EMQX] Received command: {command}")
    arduino.write((command + "\n").encode())


def on_connect_tb(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("[ThingsBoard] Connected.")
    else:
        print(f"[ThingsBoard] Connection failed with code {rc}")


def line_to_telemetry(line):
    """Convert an Arduino serial line into a ThingsBoard telemetry dict."""
    if line == "STATUS:OPEN":
        return {"door_status": "OPEN"}
    elif line == "STATUS:CLOSED":
        return {"door_status": "CLOSED"}
    elif line == "STATUS:ARMED":
        return {"armed": True}
    elif line == "STATUS:DISARMED":
        return {"armed": False}
    elif line == "STATUS:LOCKED":
        return {"lock_status": "LOCKED"}
    elif line == "STATUS:UNLOCKED":
        return {"lock_status": "UNLOCKED"}
    elif line == "ALERT:DOOR_OPENED_WHILE_ARMED":
        return {"alert": "DOOR_OPENED_WHILE_ARMED"}
    else:
        return {"raw": line}  # fallback: log anything unexpected as-is


# ---- Set up EMQX client (team broker) ----
emqx_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="frontdoor_bridge")
emqx_client.username_pw_set(EMQX_USERNAME, EMQX_PASSWORD)
emqx_client.tls_set()
emqx_client.on_connect = on_connect_emqx
emqx_client.on_message = on_message_emqx
emqx_client.connect(EMQX_HOST, EMQX_PORT)
emqx_client.loop_start()

# ---- Set up ThingsBoard client (cloud platform) ----
tb_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="frontdoor_tb_bridge")
tb_client.username_pw_set(TB_ACCESS_TOKEN)  # ThingsBoard uses access token as username, no password
tb_client.on_connect = on_connect_tb
tb_client.connect(TB_HOST, TB_PORT)
tb_client.loop_start()

# ---- Set up serial connection to Arduino ----
arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
time.sleep(2)

print("Bridge running. Listening to Arduino, publishing to EMQX and ThingsBoard...")

try:
    while True:
        if arduino.in_waiting > 0:
            line = arduino.readline().decode(errors="ignore").strip()
            if line:
                print(f"Arduino says: {line}")

                # 1. Update state and publish full JSON to EMQX (for the website)
                if update_state_from_line(line):
                    emqx_client.publish(STATUS_TOPIC, json.dumps(zone_state))
                    print(f"Published to {STATUS_TOPIC}: {zone_state}")

                # 2. Publish structured telemetry to ThingsBoard (cloud/dashboard)
                telemetry = line_to_telemetry(line)
                tb_client.publish(TB_TELEMETRY_TOPIC, json.dumps(telemetry))

        time.sleep(0.1)

except KeyboardInterrupt:
    print("Stopping bridge...")
    emqx_client.loop_stop()
    emqx_client.disconnect()
    tb_client.loop_stop()
    tb_client.disconnect()
    arduino.close()