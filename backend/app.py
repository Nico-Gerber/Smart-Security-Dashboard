from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


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


if __name__ == "__main__":
    app.run(debug=True, port=5000)