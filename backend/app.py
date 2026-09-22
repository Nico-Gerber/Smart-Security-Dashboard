from flask import Flask, jsonify, request
from flask_cors import CORS

import paho.mqtt.client as mqtt

import pymysql


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


def db_connection():
    return pymysql.connect(
        host="smarthome-db.c70ieeogomw1.us-east-2.rds.amazonaws.com",
        user="admin",
        password="SmartHom3",
        database="smarthome_db",
        port=3306,
        cursorclass=pymysql.cursors.DictCursor
    )



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


if __name__ == "__main__":
    app.run(
        debug=True,
        port=5001,
        use_reloader=False
    )