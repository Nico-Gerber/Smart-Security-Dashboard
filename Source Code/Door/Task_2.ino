#include <Servo.h>

const int BALL_SWITCH_PIN = 2;
const int BUZZER_PIN = 8;
const int SERVO_PIN = 9;

Servo lockServo;

bool armed = false;
bool doorOpen = false;
bool lastDoorOpen = false;

// Non-blocking debounce: avoids using delay(), which would also
// delay how quickly incoming Serial commands get read.
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50; // ms

void setup() {
  Serial.begin(9600);
  pinMode(BALL_SWITCH_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  lockServo.attach(SERVO_PIN);
  lockServo.write(0); // start "unlocked"
}

void loop() {
  // ---- 1. Read sensor with debounce ----
  // NOTE: with INPUT_PULLUP, the pin reads HIGH by default and LOW
  // when the switch connects to ground. Test your physical wiring —
  // if "open" and "closed" print backwards from what you see, swap
  // the "== HIGH" below to "== LOW".
  bool rawReading = digitalRead(BALL_SWITCH_PIN) == HIGH;

  if (rawReading != doorOpen && (millis() - lastDebounceTime) > debounceDelay) {
    doorOpen = rawReading;
    lastDebounceTime = millis();
  }

  // ---- 2. Report state changes (out direction) ----
  if (doorOpen != lastDoorOpen) {
    Serial.println(doorOpen ? "STATUS:OPEN" : "STATUS:CLOSED");
    lastDoorOpen = doorOpen;
  }

  // ---- 3. Alarm logic ----
  if (armed && doorOpen) {
    tone(BUZZER_PIN, 1000); // passive buzzer: needs a frequency signal
    Serial.println("ALERT:DOOR_OPENED_WHILE_ARMED");
  } else {
    noTone(BUZZER_PIN);
  }

  // ---- 4. Listen for incoming commands (in direction) ----
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "ARM") {
      armed = true;
      Serial.println("STATUS:ARMED");
    } else if (cmd == "DISARM") {
      armed = false;
      Serial.println("STATUS:DISARMED");
    } else if (cmd == "LOCK") {
      lockServo.write(90);
      Serial.println("STATUS:LOCKED");
    } else if (cmd == "UNLOCK") {
      lockServo.write(0);
      Serial.println("STATUS:UNLOCKED");
    }
  }
}
