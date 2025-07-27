#include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <HTTPClient.h>

#define SS_PIN 5
#define RST_PIN 21

const char* nombreDispositivo ="Entrada de prueba";

const char* ssid = "";
const char* password = "";
const char* apiEndpoint = "http://192.168.2.191:3000/api/rfid"; // Reemplaza con tu IP local y puerto

WiFiServer server(80);
MFRC522 mfrc522(SS_PIN, RST_PIN);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

String lastUID = "";
String lastTimestamp = "N/A";
bool timeSynced = false;
bool newScanAvailable = false;

void setup() {
  Serial.begin(115200);
  while(!Serial); // Espera solo para USB
  
  // 1. Conectar a WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi...");
  unsigned long wifiTimeout = millis() + 20000; // 20 segundos de timeout
  
  while(WiFi.status() != WL_CONNECTED && millis() < wifiTimeout) {
    delay(500);
    Serial.print(".");
  }
  
  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("\nError: No se pudo conectar al WiFi");
    return;
  }
  
  Serial.println("\nConectado! IP: " + WiFi.localIP().toString());

  // 2. Configurar cliente NTP
  timeClient.begin();
  timeClient.setTimeOffset(-18000); // Ajustar según zona horaria (ej. -5h = -18000)
  timeClient.setUpdateInterval(60000); // Actualizar cada 60 segundos

  // 3. Forzar sincronización inicial
  forceTimeSync();
  
  // 4. Inicializar RFID
  SPI.begin(18, 19, 23, SS_PIN);
  mfrc522.PCD_Init();
  
  server.begin();
}

void forceTimeSync() {
  Serial.println("Sincronizando hora con servidor NTP...");
  
  for(int i = 0; i < 5; i++) { // 5 intentos
    if(timeClient.forceUpdate()) {
      timeSynced = true;
      Serial.println("Hora sincronizada correctamente");
      printCurrentTime(); // Mostrar hora actual
      return;
    }
    delay(1000);
  }
  
  Serial.println("Error: No se pudo sincronizar la hora");
}

void printCurrentTime() {
  timeClient.update();
  Serial.print("Fecha y hora actual: ");
  Serial.println(getFormattedDateTime());
}

String getFormattedDateTime() {
  if(!timeSynced) return "Hora no sincronizada";
  
  timeClient.update();
  unsigned long epochTime = timeClient.getEpochTime();
  
  // Convertir epoch time a estructura tm
  time_t rawtime = (time_t)epochTime;
  struct tm *tiempo = localtime(&rawtime);

  // Formatear como DD/MM/YYYY HH:MM:SS
  char buffer[30];
  strftime(buffer, sizeof(buffer), "%d/%m/%Y %H:%M:%S", tiempo);
  return String(buffer);
}

void registerScanToAPI(String uid) {
  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("Error: No hay conexión WiFi para registrar el escaneo");
    return;
  }

  HTTPClient http;
  
  http.begin(apiEndpoint);
  http.addHeader("Content-Type", "application/json");
  
  // Crear el JSON para enviar
String httpRequestData = "{\"uid\":\"" + uid + "\",\"device_id\":\"" + nombreDispositivo + "\"}";

  
  int httpResponseCode = http.POST(httpRequestData);
  
  if(httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Registro exitoso. Código de respuesta: ");
    Serial.println(httpResponseCode);
    Serial.print("Respuesta: ");
    Serial.println(response);
  } else {
    Serial.print("Error al registrar. Código: ");
    Serial.println(httpResponseCode);
    Serial.print("Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  http.end();
}

void loop() {
  // Mantener sincronización de hora
  if(millis() % 60000 == 0 && WiFi.status() == WL_CONNECTED) {
    timeClient.update();
    if(timeClient.getEpochTime() > 1700000000) { // Verificar fecha razonable (después de 2023)
      timeSynced = true;
    }
  }

  // Lectura RFID
  if(mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    lastUID = getUID();
    lastTimestamp = getFormattedDateTime();
    newScanAvailable = true;
    
    Serial.print("Tarjeta leída [UID:");
    Serial.print(lastUID);
    Serial.print("] Fecha/Hora: ");
    Serial.println(lastTimestamp);

    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
  }

  // Registrar nuevo escaneo en la API
  if(newScanAvailable && WiFi.status() == WL_CONNECTED) {
    registerScanToAPI(lastUID);
    newScanAvailable = false;
  }

  handleWebClient();
  delay(100);
}

String getUID() {
  String uidStr;
  for(byte i = 0; i < mfrc522.uid.size; i++) {
    char buff[3];
    sprintf(buff, "%02X", mfrc522.uid.uidByte[i]);
    uidStr += buff;
  }
  return uidStr;
}

void handleWebClient() {
  if(WiFi.status() != WL_CONNECTED) return;
  
  WiFiClient client = server.available();
  if(!client) return;

  // Leer solicitud
  while(client.available()) client.read();

  // Responder con JSON
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.println();
  client.print("{");
  client.print("\"uid\":\"");
  client.print(lastUID);
  client.print("\",\"fecha_hora\":\"");
  client.print(lastTimestamp);
  client.println("\"}");
  client.stop();
}