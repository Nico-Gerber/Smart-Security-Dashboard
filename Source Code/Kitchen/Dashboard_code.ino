#include <LiquidCrystal.h>

LiquidCrystal lcd(7, 6, 5, 4, 3, 2);

const int tempPin = A0;

const int greenLEDpin = 9;
const int redLEDpin = 10;
const int blueLEDpin = 11;

float lowThreshold = 20.0;
float highThreshold = 28.0;

String lastCommand = "NONE";

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);

  pinMode(redLEDpin, OUTPUT);
  pinMode(greenLEDpin, OUTPUT);
  pinMode(blueLEDpin, OUTPUT);

  lcd.print("Starting...");
}

void loop() {
  int rawValue = analogRead(tempPin);
  float voltage = rawValue * (5.0 / 1023.0);
  float tempC = (voltage - 0.5) * 100.0;

  Serial.println(tempC, 1);

  if (tempC > highThreshold) {
    setColor(150, 0, 0);
  } else if (tempC < lowThreshold) {
    setColor(0, 0, 150);
  } else {
    setColor(0, 150, 0);
  }

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(tempC, 1);
  lcd.print((char)223);
  lcd.print("C");

  lcd.setCursor(0, 1);
  lcd.print(lastCommand);

  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    handleCommand(command);
  }

  delay(1000);
}

void handleCommand(String command) {
  command.trim();

  String source = "";
  String body = command;

  if (command.startsWith("[")) {
    int closeBracket = command.indexOf(']');
    if (closeBracket > 0) {
      source = command.substring(1, closeBracket);
      body = command.substring(closeBracket + 1);
      body.trim();
    }
  }

  int spaceIndex = body.indexOf(' ');
  if (spaceIndex > 0) {
    String type = body.substring(0, spaceIndex);
    float value = body.substring(spaceIndex + 1).toFloat();
    type.toUpperCase();

    if (type == "HIGH") {
      highThreshold = value;
    } else if (type == "LOW") {
      lowThreshold = value;
    }
  }

  String display = source.length() > 0 ? (source + ":" + body) : body;
  lastCommand = display.substring(0, 16);
}

void setColor(int r, int g, int b) {
  analogWrite(redLEDpin, r);
  analogWrite(greenLEDpin, g);
  analogWrite(blueLEDpin, b);
}