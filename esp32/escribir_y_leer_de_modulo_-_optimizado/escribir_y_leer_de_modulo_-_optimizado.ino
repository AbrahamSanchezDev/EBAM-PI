#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN    5    // SDA
#define RST_PIN   21   // RST

MFRC522 mfrc522(SS_PIN, RST_PIN);
String inputData = "";
enum SystemState { MENU, WRITING, READING };
SystemState currentState = MENU;
unsigned long lastActivityTime = 0;
const long timeout = 30000; // 30 segundos timeout

void setup() {
  Serial.begin(115200);
  while (!Serial); // Espera inicialización Serial
  
  SPI.begin(18, 19, 23, SS_PIN);
  mfrc522.PCD_Init();
  
  Serial.println("\nSistema RFID listo");
  showMenu();
}

void loop() {
  // Manejo de timeout
  if (currentState != MENU && millis() - lastActivityTime > timeout) {
    Serial.println("\nTimeout - Operación cancelada");
    resetToMenu();
  }

  switch(currentState) {
    case MENU:
      handleMenu();
      break;
    case WRITING:
      handleWriteOperation();
      break;
    case READING:
      handleReadOperation();
      break;
  }
}

void showMenu() {
  currentState = MENU;
  lastActivityTime = 0;
  Serial.println("\nMENU PRINCIPAL:");
  Serial.println("1. Escribir en tarjeta");
  Serial.println("2. Leer tarjeta");
  Serial.print("Seleccione opción: ");
}

void resetToMenu() {
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  currentState = MENU;
  inputData = "";
  showMenu();
}

void handleMenu() {
  if (Serial.available()) {
    char opcion = Serial.read();
    while (Serial.available()) { Serial.read(); } // Limpiar buffer
    
    if (opcion == '1') {
      startWriteOperation();
    } 
    else if (opcion == '2') {
      startReadOperation();
    } 
    else {
      Serial.println("Opción inválida");
      showMenu();
    }
  }
}

void startWriteOperation() {
  currentState = WRITING;
  lastActivityTime = millis();
  inputData = "";
  Serial.println("\nIngrese información (max 15 caracteres, finalice con '#'):");
}

void startReadOperation() {
  currentState = READING;
  lastActivityTime = millis();
  Serial.println("\nAcerca la tarjeta al lector...");
}

void handleWriteOperation() {
  // Procesar entrada de datos
  if (Serial.available()) {
    char c = Serial.read();
    if (c == '#') {
      attemptWrite();
    } else if (inputData.length() < 15) {
      inputData += c;
    }
  }
  
  // Detección de tarjeta
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    if (inputData.length() > 0) {
      attemptWrite();
    }
  }
}

void handleReadOperation() {
  // Detección de tarjeta
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    attemptRead();
  }
}

void attemptWrite() {
  byte block = 1;
  byte buffer[16];
  memset(buffer, 0, 16);
  inputData.getBytes(buffer, 16);

  MFRC522::MIFARE_Key key;
  for (byte i = 0; i < 6; i++) key.keyByte[i] = 0xFF;

  MFRC522::StatusCode status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(mfrc522.uid));
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Error en autenticación: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    resetToMenu();
    return;
  }

  status = mfrc522.MIFARE_Write(block, buffer, 16);
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Error escribiendo: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
  } else {
    Serial.println("¡Datos escritos con éxito!");
  }
  
  resetToMenu();
}

void attemptRead() {
  byte block = 1;
  byte buffer[18];
  byte size = sizeof(buffer);

  MFRC522::MIFARE_Key key;
  for (byte i = 0; i < 6; i++) key.keyByte[i] = 0xFF;

  MFRC522::StatusCode status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(mfrc522.uid));
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Error en autenticación: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    resetToMenu();
    return;
  }

  status = mfrc522.MIFARE_Read(block, buffer, &size);
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Error leyendo: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
  } else {
    Serial.print("Datos leídos: ");
    for (byte i = 0; i < 16; i++) {
      if (buffer[i] != 0) {
        Serial.print((char)buffer[i]);
      }
    }
    Serial.println();
  }
  
  resetToMenu();
}
