void setup() {
  pinMode(2, OUTPUT);  // GPIO2 es el LED integrado en la mayoría de NodeMCU ESP32
}

void loop() {
  digitalWrite(2, HIGH);  // Enciende el LED
  delay(1000);            // Espera 1 segundo
  digitalWrite(2, LOW);   // Apaga el LED
  delay(1000);            // Espera 1 segundo
}