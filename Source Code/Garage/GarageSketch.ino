#include <WiFiS3.h>


// WiFi

const char WIFI_SSID[] = "NETWORK X50-1";
const char WIFI_PASS[] = "...";

IPAddress EDGE_HOST(192, 168, 68, 70);
const int EDGE_PORT = 5010;

const unsigned long HTTP_TIMEOUT_MS  = 2000;
const unsigned long POLL_INTERVAL_MS = 500;


// Pins

const int garageDoorPin = 2;
const int disarmedLed   = 4;
const int armedLed      = 3;
const int buzzerPin     = 5;


// State

int lastDoorState = -1;

bool appliedArmed  = false;
bool appliedBuzzer = false;

unsigned long lastPoll = 0;



// WiFi

void connectWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  // Wait for DHCP
  while (WiFi.localIP() == IPAddress(0, 0, 0, 0)) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi connected, IP: ");
  Serial.println(WiFi.localIP());
}



bool httpRequest(const char* method, const String& path,
                 const String& body, String& responseBody) {

  WiFiClient client;

  if (!client.connect(EDGE_HOST, EDGE_PORT)) {
    client.stop();
    Serial.print("Edge connect failed: ");
    Serial.println(path);
    return false; 
  }

  String req = String(method) + " " + path + " HTTP/1.1\r\n";
  req += "Host: " + EDGE_HOST.toString() + "\r\n";
  req += "Connection: close\r\n";

  if (body.length() > 0) {
    req += "Content-Type: application/json\r\n";
    req += "Content-Length: " + String(body.length()) + "\r\n";
  }

  req += "\r\n";
  req += body;

  client.print(req);

  String response = "";
  unsigned long start = millis();

  while ((client.connected() || client.available()) &&
         millis() - start < HTTP_TIMEOUT_MS) {
    while (client.available()) {
      response += (char)client.read();
    }
  }

  client.stop();

  if (!response.startsWith("HTTP/1.1 200") &&
      !response.startsWith("HTTP/1.0 200")) {
    Serial.print("Edge error on ");
    Serial.print(path);
    Serial.print(": ");
    Serial.println(response.length() ? response.substring(0, response.indexOf('\n'))
                                     : String("(no response)"));
    return false;
  }

  int bodyStart = response.indexOf("\r\n\r\n");
  responseBody = (bodyStart == -1) ? "" : response.substring(bodyStart + 4);
  responseBody.trim();
  return true;
}



void sendDoorState(int value) {
  String body = "{\"reed\":" + String(value) + "}";
  String reply;

  if (httpRequest("POST", "/sensor", body, reply)) {
    Serial.print("Sent reed value: ");
    Serial.println(value);
  }
}




void applyState(bool armed, bool buzzer) {

  if (armed != appliedArmed) {
    digitalWrite(armedLed,    armed ? HIGH : LOW);
    digitalWrite(disarmedLed, armed ? LOW  : HIGH);
    appliedArmed = armed;

    Serial.println(armed ? "Garage ARMED" : "Garage DISARMED");
  }

  if (buzzer != appliedBuzzer) {
    if (buzzer) {
      tone(buzzerPin, 2000);
    } else {
      noTone(buzzerPin);
    }
    appliedBuzzer = buzzer;

    Serial.println(buzzer ? "Buzzer ON" : "Buzzer OFF");
  }
}





void pollState() {
  String body;
  String path = "/state?reed=" + String(lastDoorState);

  if (!httpRequest("GET", path, "", body)) {
    return;
  }

  if (body.length() < 3 || body.charAt(1) != ',') {
    Serial.print("Bad /state body: ");
    Serial.println(body);
    return;
  }

  applyState(body.charAt(0) == '1', body.charAt(2) == '1');
}




void setup() {
  Serial.begin(9600);

  pinMode(garageDoorPin, INPUT_PULLUP);
  pinMode(disarmedLed, OUTPUT);
  pinMode(armedLed, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  digitalWrite(disarmedLed, HIGH);
  digitalWrite(armedLed, LOW);
  noTone(buzzerPin);

  connectWiFi();

  lastDoorState = digitalRead(garageDoorPin);

  pollState();
  lastPoll = millis();
}



void loop() {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost");
    connectWiFi();
  }


  int reading = digitalRead(garageDoorPin);

  if (reading != lastDoorState) {
    delay(50);
    reading = digitalRead(garageDoorPin);

    if (reading != lastDoorState) {
      lastDoorState = reading;
      Serial.println(reading == HIGH ? "Garage door OPENED" : "Garage door CLOSED");

      sendDoorState(lastDoorState);
      pollState();
      lastPoll = millis();
    }
  }

  if (millis() - lastPoll > POLL_INTERVAL_MS) {
    lastPoll = millis();
    pollState();
  }
}
