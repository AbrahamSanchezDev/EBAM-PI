#include <SPI.h>
#include <MFRC522.h>

// Definición de pines según la conexión proporcionada
#define SS_PIN    5    // SDA
#define RST_PIN   21   // RST

// Inicialización del objeto MFRC522
MFRC522 mfrc522(SS_PIN, RST_PIN);

// Variables globales
String inputData = ""; // Almacena los datos a escribir

void setup() {
  Serial.begin(115200);
  while (!Serial); // Espera a que se inicie el Monitor Serial
  Serial.println("Inicializando RC522...");

  // Inicializa el bus SPI con los pines: SCK=18, MISO=19, MOSI=23, SS=5
  SPI.begin(18, 19, 23, SS_PIN);

  mfrc522.PCD_Init();
  Serial.println("RFID RC522 listo");
}

void loop() {
  // Muestra el menú principal
  Serial.println("\nMENU:");
  Serial.println("1. Escribir en tarjeta");
  Serial.println("2. Leer tarjeta");
  Serial.print("Seleccione opcion: ");

  // Espera hasta que el usuario ingrese una opción
  while (Serial.available() == 0) {
    // Esperando la entrada del usuario
  }
  
  char opcion = Serial.read();
  // Limpia el buffer serial (si hay caracteres residuales)
  while (Serial.available()) { Serial.read(); }

  if (opcion == '1') {
    escribirDatos();
  } 
  else if (opcion == '2') {
    leerDatos();
  } 
  else {
    Serial.println("Opcion invalida, intente de nuevo.");
    delay(2000);
  }
}

// Función para escribir datos en la tarjeta
void escribirDatos() {
  Serial.println("\nIngrese informacion (max 15 caracteres, finalice con '#' ):");
  inputData = "";
  bool finalizado = false;

  // Lee caracteres del Monitor Serial hasta encontrar '#' o alcanzar 15 caracteres
  while (!finalizado) {
    if (Serial.available()) {
      char c = Serial.read();
      if (c == '#') {
        finalizado = true;
      } else {
        if (inputData.length() < 15) {//""-Jorge#-J
          inputData += c;//J-o
        }
      }
    }
  }
  
  Serial.print("Datos a escribir: ");
  Serial.println(inputData);
  Serial.println("Acerca la tarjeta al lector para escribir...");

  // Espera a que se acerque una tarjeta
  while (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    // Espera a la deteccion de la tarjeta
  }
  
  byte block = 1; // Se usará el bloque 1 (primer sector, bloque 0 queda intacto)
  byte buffer[16];
  memset(buffer, 0, 16);

  // Copia la cadena a escribir en el buffer (rellena hasta 16 bytes)
  for (int i = 0; i < inputData.length(); i++) {
    buffer[i] = inputData.charAt(i);//J-o-r-g-e
  }
  
  // Se define la clave por defecto: 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF
  MFRC522::MIFARE_Key key;
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
  
  // Autentica para el bloque seleccionado usando la clave por defecto
  MFRC522::StatusCode status;
  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(mfrc522.uid));
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Error en autenticacion: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    mfrc522.PICC_HaltA();
    return;
  }
  
  // Escribe los datos en el bloque 1
  status = mfrc522.MIFARE_Write(block, buffer, 16);
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Error escribiendo: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
  } else {
    Serial.println("Datos escritos con exito!");
  }
  
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  
  // Espera 5 segundos antes de volver al menú
  delay(5000);
}

// Función para leer datos de la tarjeta
void leerDatos() {
  Serial.println("\nAcerca la tarjeta al lector para leer...");
  
  // Espera a que se acerque una tarjeta
  while (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    // Espera a la deteccion de la tarjeta
  }
  
  byte block = 1; // Se leerá el bloque 1
  byte buffer[18];  // Buffer para leer (16 bytes de datos + 2 bytes de control)
  byte size = sizeof(buffer);
  
  // Se define la clave por defecto: 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF
  MFRC522::MIFARE_Key key;
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
  
  MFRC522::StatusCode status;
  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(mfrc522.uid));
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Error en autenticacion: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    mfrc522.PICC_HaltA();
    return;
  }
  
  status = mfrc522.MIFARE_Read(block, buffer, &size);
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Error leyendo: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
  } else {
    Serial.print("Datos leidos: ");
    for (byte i = 0; i < 16; i++) {
      Serial.print((char)buffer[i]);
    }
    Serial.println();
  }
  
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  
  // Espera 1 segundos antes de volver al menú
  delay(1000);
}
