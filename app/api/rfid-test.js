// pages/api/rfid.js
import { connectToDatabase } from "../lib/mongodb";

export async function testRFIDPost() {
  // Datos de prueba
  const testData = [
    { uid: "7A3B8C2D", device_id: "ESP32_1" },
    { uid: "4E5F6G7H", device_id: "ESP32_1" },
    { uid: "1K2L3M4N", device_id: "ESP32_2" },
    { uid: "9P0Q1R2S", device_id: "ESP32_3" },
    { uid: "T5U6V7W8", device_id: "ESP32_2" },
  ];

  // Configuración
  const API_URL = "http://localhost:3000/api/rfid";
  const DELAY_MS = 1000; // 1 segundo entre requests

  console.log("Iniciando pruebas de POST a RFID endpoint...");

  try {
    // Enviar cada registro con un delay
    for (const [index, data] of testData.entries()) {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error(
          `Error en la solicitud POST: ${response.status} ${response.statusText}`
        );
        throw new Error(
          `Error en la solicitud POST: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      console.log(`Test ${index + 1}/${testData.length}:`, {
        status: response.status,
        dataSent: data,
        serverResponse: result,
        timestamp: new Date().toISOString(),
      });

      if (index < testData.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    console.log("✅ Todas las pruebas POST completadas con éxito");
    return { success: true, count: testData.length };
  } catch (error) {
    console.error("❌ Error en las pruebas POST:", error);
    return { success: false, error: error.message };
  }
}
