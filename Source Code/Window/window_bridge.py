import serial
import time
import paho.mqtt.client as mqtt
import json

# EMQX CLOUD DETAILS

BROKER_HOST = "l69c6c62.ala.asia-southeast1.emqxsl.com"
BROKER_PORT = 8883

MQTT_USERNAME = "smart_home_team"
MQTT_PASSWORD = "smarthome"

# WINDOW ZONE MQTT TOPICS

STATUS_TOPIC = "home/window/status"
COMMAND_TOPIC = "home/window/command"

# ARDUINO SERIAL SETTINGS

SERIAL_PORT = "/dev/ttyACM0"
BAUD_RATE = 9600


# MQTT CONNECTION

def on_connect(client, userdata, flags, rc, properties=None):

    if rc == 0:
        print("Connected to MQTT broker.")

        client.subscribe(COMMAND_TOPIC)

        print(f"Subscribed to {COMMAND_TOPIC}")

    else:
        print(f"Connection failed with code {rc}")


# MQTT COMMAND RECEIVED

def on_message(client, userdata, msg):

    command = msg.payload.decode().strip()

    print(f"Received command: {command}")

    arduino.write((command + "\n").encode())


# SET UP MQTT

client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="window_bridge"
)

client.username_pw_set(
    MQTT_USERNAME,
    MQTT_PASSWORD
)

client.tls_set()

client.on_connect = on_connect
client.on_message = on_message

client.connect(
    BROKER_HOST,
    BROKER_PORT
)

client.loop_start()


# CONNECT TO ARDUINO

arduino = serial.Serial(
    SERIAL_PORT,
    BAUD_RATE,
    timeout=1
)

time.sleep(2)

print("Window Zone bridge running.")
print("Listening to Arduino and MQTT...")


# MAIN LOOP

try:

    while True:

        if arduino.in_waiting > 0:

            line = arduino.readline().decode(
                errors="ignore"
            ).strip()

            if line:

                print(f"Arduino says: {line}")

                if line == "ALARM_ON":
                    status_data = {
                        "status": "!!Motion!!",
                        "alarm": True,
                        "armed": True
                    }

                elif line == "ALARM_OFF":
                    status_data = {
                        "status": "No Motion",
                        "alarm": False,
                        "armed": True
                    }

                elif line == "ARMED":
                    status_data = {
                        "status": "No Motion",
                        "alarm": False,
                        "armed": True
                    }

                elif line == "DISARMED":
                    status_data = {
                        "status": "N/A",
                        "alarm": False,
                        "armed": False
                    }

                else:
                    status_data = {
                        "status": "No Motion",
                        "alarm": False,
                        "armed": True
                    }

                # Convert Python dictionary to JSON
                status_msg = json.dumps(status_data)

                print(f"Publishing: {status_msg}")

                client.publish(
                    STATUS_TOPIC,
                    status_msg
                )

        time.sleep(0.1)


except KeyboardInterrupt:

    print("Stopping bridge...")

    client.loop_stop()
    client.disconnect()
    arduino.close()