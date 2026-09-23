from flask import Flask, jsonify, request
from flask_cors import CORS

import paho.mqtt.client as mqtt

import pymysql


import json
import time


app = Flask(__name__)
CORS(app)

# MQTT configuration
MQTT_HOST = "l69c6c62.ala.asia-southeast1.emqxsl.com"
MQTT_PORT = 8883

MQTT_USERNAME = "smart_home_team"
MQTT_PASSWORD = "smarthome"

GARAGE_COMMAND_TOPIC = "home/garage/command"


FRONTDOOR_COMMAND_TOPIC = "home/frontdoor/command"


WINDOW_COMMAND_TOPIC = "home/window/command"

TEMPERATURE_COMMAND_TOPIC = "home/temperature/command"


GARAGE_STATUS_TOPIC = "home/garage/status"
FRONTDOOR_STATUS_TOPIC = "home/frontdoor/status"
WINDOW_STATUS_TOPIC = "home/window/status"
TEMPERATURE_STATUS_TOPIC = "home/temperature/status"


latest_status = {
    "garage": None,
    "frontdoor": None,
    "window": None,
    "temperature": None
}


def on_connect(client, userdata, flags, reason_code, properties):
    print("Connected to MQTT broker")

    client.subscribe(GARAGE_STATUS_TOPIC)
    client.subscribe(FRONTDOOR_STATUS_TOPIC)
    client.subscribe(WINDOW_STATUS_TOPIC)
    client.subscribe(TEMPERATURE_STATUS_TOPIC)

    print("Subscribed to status topics")


def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()

        print("Received:", msg.topic, payload)

        data = json.loads(payload)

        data["last_received"] = time.time()

        if msg.topic == GARAGE_STATUS_TOPIC:

            previous = latest_status["garage"]

            latest_status["garage"] = data

            if previous is None or previous.get("status") != data.get("status"):
                door_status = data.get("status")

                save_activity_log(
                    "garage",
                    f"Garage door {door_status}",
                    "Warning" if door_status == "open" and data.get("armed") else "Info"
                )

            if previous is None or previous.get("armed") != data.get("armed"):
                save_activity_log(
                    "garage",
                    "Garage armed" if data.get("armed") else "Garage disarmed",
                    "Info"
                )


        elif msg.topic == FRONTDOOR_STATUS_TOPIC:

            previous = latest_status["frontdoor"]

            latest_status["frontdoor"] = data

            if previous is None or previous.get("status") != data.get("status"):
                door_status = data.get("status")

                save_activity_log(
                    "frontdoor",
                    f"Front door {door_status}",
                    "Warning" if door_status == "open" and data.get("armed") else "Info"
                )

            if previous is None or previous.get("armed") != data.get("armed"):
                save_activity_log(
                    "frontdoor",
                    "Front door armed" if data.get("armed") else "Front door disarmed",
                    "Info"
                )

            if previous is None or previous.get("locked") != data.get("locked"):
                save_activity_log(
                    "frontdoor",
                    "Front door locked" if data.get("locked") else "Front door unlocked",
                    "Info"
                )


        elif msg.topic == WINDOW_STATUS_TOPIC:

            previous = latest_status["window"]

            latest_status["window"] = data

            if previous is None or previous.get("status") != data.get("status"):
                window_status = data.get("status")

                save_activity_log(
                    "window",
                    f"Window {window_status}",
                    "Warning" if window_status == "open" and data.get("armed") else "Info"
                )

            if previous is None or previous.get("armed") != data.get("armed"):
                save_activity_log(
                    "window",
                    "Window armed" if data.get("armed") else "Window disarmed",
                    "Info"
                )


        elif msg.topic == TEMPERATURE_STATUS_TOPIC:

            previous = latest_status["temperature"]

            latest_status["temperature"] = data

            if previous is None or previous.get("temperature") != data.get("temperature"):
                save_activity_log(
                    "temperature",
                    f"Temperature updated to {data.get('temperature')}°C",
                    "Info"
                )


    except json.JSONDecodeError:
        print("Invalid JSON received on:", msg.topic)

    except Exception as error:
        print("Failed to process MQTT message:", error)

# Create MQTT client
mqtt_client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2
)

mqtt_client.username_pw_set(
    MQTT_USERNAME,
    MQTT_PASSWORD
)

mqtt_client.tls_set()


mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

mqtt_client.connect(
    MQTT_HOST,
    MQTT_PORT
)

mqtt_client.loop_start()





def db_connection():
    return pymysql.connect(
        host="smarthome-db.c70ieeogomw1.us-east-2.rds.amazonaws.com",
        user="admin",
        password="SmartHom3",
        database="smarthome_db",
        port=3306,
        cursorclass=pymysql.cursors.DictCursor
    )

def save_activity_log(zone, event, status):
    connection = db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO activity_log
                (zone, event, status)
                VALUES (%s, %s, %s)
            """, (
                zone,
                event,
                status
            ))

        connection.commit()

        print("Activity logged:", zone, event, status)

    except Exception as error:
        print("Failed to save activity log:", error)

    finally:
        connection.close()

@app.route("/api/activity", methods=["GET"])
def get_activity():
    connection = db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT *
                FROM activity_log
                ORDER BY event_time DESC
                LIMIT 100
            """)

            logs = cursor.fetchall()

        return jsonify(logs)

    finally:
        connection.close()

@app.route("/api/status", methods=["GET"])
def get_status():
    return jsonify(latest_status)


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


#Get Automation Data

@app.route("/automation", methods=["GET"])
def get_automation():
    connection = db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT *
                FROM automation_settings
                WHERE id = 1
            """)

            settings = cursor.fetchone()

        if settings:
            settings["arm_time"] = str(settings["arm_time"])
            settings["disarm_time"] = str(settings["disarm_time"])

        return jsonify(settings)

    finally:
        connection.close()


#Set Automation Data

@app.route("/automation", methods=["PUT"])
def update_automation():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No JSON body provided"
        }), 400

    arm_automation_on = data.get("armAutomationOn")
    arm_time = data.get("armTime")
    disarm_time = data.get("disarmTime")


    connection = db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE automation_settings
                SET
                    arm_automation_on = %s,
                    arm_time = %s,
                    disarm_time = %s
                WHERE id = 1
            """, (
                arm_automation_on,
                arm_time,
                disarm_time
            ))

        connection.commit()

        return jsonify({
            "message": "Automation settings updated"
        }), 200

    finally:
        connection.close()


#Garage Endpoint

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





#Frontdoor Endpoint
@app.route("/api/frontdoor/command", methods=["POST"])
def frontdoor_command():

    data = request.get_json()

    if not data or "command" not in data:
        return jsonify({
            "success": False,
            "error": "Command is required"
        }), 400

    command = data["command"].upper()

    if command not in ["ARM", "DISARM", "LOCK", "UNLOCK"]:
        return jsonify({
            "success": False,
            "error": "Invalid command"
        }), 400

    result = mqtt_client.publish(
        FRONTDOOR_COMMAND_TOPIC,
        command
    )

    if result.rc != mqtt.MQTT_ERR_SUCCESS:
        return jsonify({
            "success": False,
            "error": "Failed to publish MQTT command"
        }), 500

    return jsonify({
        "success": True,
        "zone": "frontdoor",
        "command": command
    }), 200


#Window Endpoint
@app.route("/api/window/command", methods=["POST"])
def window_command():

    data = request.get_json()

    if not data or "command" not in data:
        return jsonify({
            "success": False,
            "error": "Command is required"
        }), 400

    command = data["command"].upper()

    if command not in ["ARM", "DISARM"]:
        return jsonify({
            "success": False,
            "error": "Invalid command"
        }), 400

    result = mqtt_client.publish(
        WINDOW_COMMAND_TOPIC,
        command
    )

    if result.rc != mqtt.MQTT_ERR_SUCCESS:
        return jsonify({
            "success": False,
            "error": "Failed to publish MQTT command"
        }), 500

    return jsonify({
        "success": True,
        "zone": "window",
        "command": command
    }), 200




#Temperature Endpoint
@app.route("/api/temperature/command", methods=["POST"])
def temperature_command():

    data = request.get_json()

    if not data or "command" not in data:
        return jsonify({
            "success": False,
            "error": "Command is required"
        }), 400

    command = data["command"].upper()


    result = mqtt_client.publish(
        TEMPERATURE_COMMAND_TOPIC, 
        command
    )

    return jsonify({
        "success": True,
        "zone": "temperature",
        "command": command
    }), 200




if __name__ == "__main__":
    app.run(
        debug=True,
        port=5001,
        use_reloader=False
    )
