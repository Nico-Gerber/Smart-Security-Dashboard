from flask import Flask, jsonify, request
from flask_cors import CORS

import paho.mqtt.client as mqtt

app = Flask(__name__)
CORS(app)

# MQTT configuration
MQTT_HOST = "l69c6c62.ala.asia-southeast1.emqxsl.com"
MQTT_PORT = 8883

MQTT_USERNAME = "smart_home_team"
MQTT_PASSWORD = "smarthome"

GARAGE_COMMAND_TOPIC = "home/garage/command"


# Create MQTT client
mqtt_client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2
)

mqtt_client.username_pw_set(
    MQTT_USERNAME,
    MQTT_PASSWORD
)

mqtt_client.tls_set()

mqtt_client.connect(
    MQTT_HOST,
    MQTT_PORT
)

mqtt_client.loop_start()


@app.route("/")
def home():
    return jsonify({
        "message": "Smart Home backend running"
    })


@app.route("/api/test")
def test():
    return jsonify({
        "status": "ok"
    })


@app.route("/api/garage/command", methods=["POST"])
def garage_command():

    data = request.get_json()

    command = data["command"].lower()

    mqtt_client.publish(
        GARAGE_COMMAND_TOPIC,
        command
    )

    return jsonify({
        "message": "command sent",
        "command": command
    })


if __name__ == "__main__":
    app.run(
        debug=True,
        port=5001,
        use_reloader=False
    )