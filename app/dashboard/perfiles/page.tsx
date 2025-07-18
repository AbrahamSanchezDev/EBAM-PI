"use client";
import { lusitana } from "@/app/ui/fonts";
import RFIDReader from "@/app/esp32/RFIDReader";
import { InfoUsuario } from "@/app/ui/perfiles/infoUsuario";
import { useEffect, useState } from "react";
import { isUserLoggedIn } from "@/app/lib/userState";

interface Scan {
  device_id: string;
  timestamp: string;
}

export default function Page(props: {}) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!isUserLoggedIn()) {
  //     alert("Por favor, logeate para continuar");
  //     window.location.href = "/";
  //   }
  // }, []);

  useEffect(() => {
    async function fetchScans() {
      try {
        const response = await fetch("/api/scans");
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        const data = await response.json();

        // Organizar los datos del más nuevo al más viejo basado en el timestamp
        const sortedData = data.sort(
          (a: Scan, b: Scan) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setScans(sortedData);
      } catch (err) {
        console.error("Error fetching scans:", err);
        setError("No se pudo conectar a la base de datos");
      }
    }

    fetchScans();
  }, []);

  const handleTestRFIDPost = async () => {
    try {
      const testData = [
        { uid: "7A3B8C2D", device_id: "ESP32_1" },
        { uid: "4E5F6G7H", device_id: "ESP32_1" },
        { uid: "1K2L3M4N", device_id: "ESP32_2" },
        { uid: "9P0Q1R2S", device_id: "ESP32_3" },
        { uid: "T5U6V7W8", device_id: "ESP32_2" },
      ];

      for (const [index, data] of testData.entries()) {
        const response = await fetch("/api/rfid", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(
            `Error en la solicitud POST: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();
        console.log(`Test ${index + 1}/${testData.length}:`, {
          status: response.status,
          dataSent: data,
          serverResponse: result,
        });
      }

      alert("Prueba completada. Revisa la consola para más detalles.");
    } catch (error) {
      console.error("Error al ejecutar la prueba:", error);
      alert("Error al ejecutar la prueba. Revisa la consola para más detalles.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Perfiles</h1>
      </div>
      <InfoUsuario />
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <h2 className="text-xl mt-4">Registros de Scans</h2>
          <ul>
            {scans.map((scan, index) => (
              <li key={index} className="border-b py-2">
                ID: {scan.device_id}, Timestamp:{" "}
                {new Date(scan.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={handleTestRFIDPost}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Ejecutar Prueba RFID
      </button>
      <button
        onClick={async () => {
          try {
            const response = await fetch("/api/create-users", { method: "POST" });
            if (!response.ok) {
              throw new Error("Error al crear usuarios");
            }
            const result = await response.json();
            alert(result.message);
          } catch (error) {
            console.error("Error al crear usuarios:", error);
            alert("Error al crear usuarios. Revisa la consola para más detalles.");
          }
        }}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Crear Usuarios de Prueba
      </button>
    </div>
  );
}
