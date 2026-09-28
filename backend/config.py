import os

from dotenv import load_dotenv

load_dotenv()

MQTT_HOST = os.environ.get("MQTT_HOST", "l69c6c62.ala.asia-southeast1.emqxsl.com")
MQTT_PORT = int(os.environ.get("MQTT_PORT", 8883))
MQTT_USERNAME = os.environ.get("MQTT_USERNAME", "smart_home_team")
MQTT_PASSWORD = os.environ.get("MQTT_PASSWORD", "smarthome")

DB_HOST = os.environ.get("DB_HOST", "smarthome-db.c70ieeogomw1.us-east-2.rds.amazonaws.com")
DB_USER = os.environ.get("DB_USER", "admin")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "SmartHom3")
DB_NAME = os.environ.get("DB_NAME", "smarthome_db")
DB_PORT = int(os.environ.get("DB_PORT", 3306))

FLASK_PORT = int(os.environ.get("FLASK_PORT", 5001))
