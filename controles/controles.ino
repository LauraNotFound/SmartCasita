#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <WebServer.h>  
#include "DHT.h"
#include <ESP32Servo.h>  
#include <FirebaseESP32.h>  
#include <time.h>

const char* ssid = "lauranotfound";
const char* password = "Princess_0516";

FirebaseData firebaseData;
FirebaseConfig firebaseConfig;
FirebaseAuth firebaseAuth;

const char* FIREBASE_HOST = "https://smartcasitadb-default-rtdb.firebaseio.com/";  
const char* FIREBASE_AUTH = "nCgboJhKM4F311uJqt4kUmtLZ39SYJedbBLwLtQ3"; 

const int waterPin = 36;
const int pirPin = 15;
const int dhtPin = 14;
const int ledRFID = 13;
const int ledWater = 12;
const int ledMotion = 27;
const int servoPin = 26; 
const int buzzerPin = 32; 

#define DHTTYPE DHT11
DHT dht(dhtPin, DHTTYPE);

#define RST_PIN 20
#define SS_PIN 22
MFRC522 mfrc522(SS_PIN, RST_PIN);

Servo servo;

int waterLevel = 0;
int pirValue = 0;
float temperature = 0.0;
float humidity = 0.0;
bool doorOpened = false;
bool bocina = false;
bool luz = false;

byte authorizedUID[] = {0x93, 0xF2, 0x79, 0x0F};

WebServer server(80);

unsigned long previousMillisFirebase = 0;
const long intervalFirebase = 30000; 

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConectado a WiFi.");
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());

//para la marca temporal
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  firebaseConfig.host = FIREBASE_HOST;
  firebaseConfig.signer.tokens.legacy_token = FIREBASE_AUTH;
  Firebase.begin(&firebaseConfig, &firebaseAuth);
  Firebase.reconnectWiFi(true);
  Serial.println("Conectado a Firebase.");

  server.on("/", handleRoot); 
  server.on("/data", handleData); 
  server.on("/buzzer", handleBuzzer); 
  server.on("/ledMotion", luzmov); 
  server.on("/servo", operOrClose); 
  server.begin();
  Serial.println("Servidor web iniciado.");

  pinMode(pirPin, INPUT);
  pinMode(ledRFID, OUTPUT);
  pinMode(ledWater, OUTPUT);
  pinMode(ledMotion, OUTPUT);
  pinMode(buzzerPin, OUTPUT); 
  dht.begin();
  SPI.begin(5, 21, 19); 
  mfrc522.PCD_Init();

  servo.attach(servoPin);
  servo.write(0); 

  Serial.println("Sistema inicializado.");
}

void loop() {
  server.handleClient(); 

  readWaterLevel();
  readPIR();
  readRFID();
  readDHT();

  unsigned long currentMillis = millis();
  if (currentMillis - previousMillisFirebase >= intervalFirebase) {
    previousMillisFirebase = currentMillis;
    sendToFirebase(); 
  }

  delay(5000); 
}

void readWaterLevel() {
  waterLevel = analogRead(waterPin);
  Serial.print("Nivel de agua: ");
  Serial.println(waterLevel);

  if (waterLevel > 500) {
    blinkLED(ledWater, 5);
  }
}

void readPIR() {
  pirValue = digitalRead(pirPin);
  if (pirValue == HIGH) {
    digitalWrite(ledMotion, HIGH);
    Serial.println("Movimiento detectado");
  } else {
    digitalWrite(ledMotion, LOW);
    Serial.println("Sin movimiento");
  }
}

void readRFID() {
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uid += String(mfrc522.uid.uidByte[i], HEX);
    if (i < mfrc522.uid.size - 1) uid += ":";
  }
  Serial.print("UID leída: ");
  Serial.println(uid);

  if (isAuthorized(mfrc522.uid.uidByte, mfrc522.uid.size)) {
    Serial.println("Tarjeta Autorizada");
    digitalWrite(ledRFID, HIGH);

    servo.write(90); 
    doorOpened = true;
    delay(5000);
    servo.write(0);  
    doorOpened = false;

    digitalWrite(ledRFID, LOW);
  } else {
    Serial.println("Tarjeta No autorizada");
    doorOpened = false;
  }

  mfrc522.PICC_HaltA();
}

void readDHT() {
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Error al leer el sensor DHT.");
    return;
  }

  Serial.print("Temperatura: ");
  Serial.print(temperature);
  Serial.println(" °C");

  Serial.print("Humedad: ");
  Serial.print(humidity);
  Serial.println(" %");
}

bool isAuthorized(byte *uid, byte size) {
  if (size != sizeof(authorizedUID)) return false;
  for (byte i = 0; i < size; i++) {
    if (uid[i] != authorizedUID[i]) return false;
  }
  return true;
}

void blinkLED(int pin, int durationSeconds) {
  for (int i = 0; i < durationSeconds * 2; i++) {
    digitalWrite(pin, !digitalRead(pin));
    delay(500);
  }
  digitalWrite(pin, LOW);
}

void handleRoot() {
  server.send(200, "text/plain", "Bienvenido al servidor web del ESP32!");
}

//obtener marca temporal
String getTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "Failed to obtain time";
  }
  char timeStringBuff[50]; // Buffer para almacenar la cadena de tiempo
  strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(timeStringBuff);
}

void handleData() {
  String json = "{";
  json += "\"waterLevel\":" + String(waterLevel) + ","; 
  json += "\"pirValue\":" + String(pirValue) + ","; 
  json += "\"temperature\":" + String(temperature) + ","; 
  json += "\"humidity\":" + String(humidity) + ","; 
  json += "\"doorOpened\":" + String(doorOpened ? "true" : "false");
  json += "\"bocina\":" + String(bocina ? "true" : "false");
  json += "\"luz\":" + String(luz ? "true" : "false");
  json += "\"timestamp\":\"" + getTime() + "\"";
  json += "}";
  server.send(200, "application/json", json);
}

void handleBuzzer() {
  String state = server.arg("state");
  if (state == "on") {
    digitalWrite(buzzerPin, HIGH);
    server.send(200, "text/plain", "Bocina activada.");
    bocina = true;
  } else if (state == "off") {
    digitalWrite(buzzerPin, LOW);
    server.send(200, "text/plain", "Bocina desactivada.");
    bocina = false;
  } else {
    server.send(400, "text/plain", "Estado no válido.");
    bocina = false;
  }
}

void handleLedMotion() {
  String state = server.arg("state");
  if (state == "on") {
    digitalWrite(ledMotion, HIGH);
    server.send(200, "text/plain", "LED de movimiento activado.");
    luz  = true;
  } else if (state == "off") {
    digitalWrite(ledMotion, LOW);
    server.send(200, "text/plain", "LED de movimiento desactivado.");
    luz = false;
  } else {
    server.send(400, "text/plain", "Estado no válido.");
    luz = false;
  }
}

void luzmov() {
  String state = server.arg("state");
  if (state == "on") {
    digitalWrite(ledMotion, HIGH);
    server.send(200, "text/plain", "LED de movimiento activado.");
    luz  = true;
  } else if (state == "off") {
    digitalWrite(ledMotion, LOW);
    server.send(200, "text/plain", "LED de movimiento desactivado.");
    luz = false;
  }
}

void handleServo() {
  String position = server.arg("position");
  int pos = position.toInt();
  if (pos >= 0 && pos <= 180) {
    servo.write(pos);
    delay(5000); 
    servo.write(0); 
    server.send(200, "text/plain", "Servomotor movido a la posición: " + String(pos) + " y regresado a la posición inicial.");
  } else {
    server.send(400, "text/plain", "Posición no válida.");
  }
}

void operOrClose() {
  String position = server.arg("position");
  int pos = position.toInt();
  if (pos >= 0 && pos <= 180) {
    servo.write(pos);
    server.send(200, "text/plain", "Servomotor movido a la posición: " + String(pos));
  } else if (pos == 0) {
    servo.write(pos);
    server.send(200, "text/plain", "Servomotor movido a la posición: " + String(pos));
  } else{
    server.send(400, "text/plain", "Posición no válida.");
  }
}

void sendToFirebase() {
  FirebaseJson json;
  json.set("lluvia", waterLevel);
  json.set("movimiento", pirValue);
  json.set("temperatura-ambiental", temperature);
  json.set("humedad", humidity);
  json.set("puerta", doorOpened);
  json.set("bocina", bocina);
  json.set("luz", luz);
  json.set("timestamp", getTime());

  if (Firebase.pushJSON(firebaseData, "/sensorData", json)) {
    Serial.println("Datos enviados a Firebase correctamente.");
  } else {
    Serial.println("Error al enviar datos a Firebase: " + firebaseData.errorReason());
  }
}
