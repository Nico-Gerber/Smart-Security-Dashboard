// Variable Initialisation
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int BUZZER_PIN = 11;
const int LED_PIN = 12;

const float DISTANCE_THRESHOLD = 10.0;  //distance specification (10cm)

bool armed = true;
bool alarmState = false;

// Setup
void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, HIGH);

  Serial.begin(9600);
}

float getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    return -1;
  }

  float distance = duration * 0.0343 / 2.0;

  return distance;
}

// Main loop
void loop() {

  // Checking commands from website or manually inputted through RaspberryPi VM
  if (Serial.available() > 0) {

    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "ARM") {
      armed = true;

      digitalWrite(LED_PIN, HIGH);
      Serial.println("ARMED");
    }

    else if (command == "DISARM") {
      armed = false;
      alarmState = false;

      digitalWrite(LED_PIN, LOW);
      digitalWrite(BUZZER_PIN, LOW);
      Serial.println("DISARMED");
    }
  }

  float distance = getDistance();


  // ALARM_ON sent once when sensor detects object a specified distance
  if (armed && distance > 0 && distance <= DISTANCE_THRESHOLD) {

    digitalWrite(BUZZER_PIN, HIGH);

    if (!alarmState) {
      Serial.println("ALARM_ON");
      alarmState = true;
    }
  }

  else {

    // ALARM_OFF sent once when object no longer detected
    digitalWrite(BUZZER_PIN, LOW);

    if (alarmState) {
      Serial.println("ALARM_OFF");
      alarmState = false;
    }
  }

  delay(100);
}