"use client";
import { useEffect, useState } from "react";

interface Scan {
  device_id: string;
  timestamp: string;
  uid?: string;
}

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScans() {
      try {
        const response = await fetch("/api/scans");
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        const data = await response.json();
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

  // Botón para pruebas RFID
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
          headers: { "Content-Type": "application/json" },
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
    <div className="w-full p-6">
      <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2a4 4 0 018 0v2m-4-4a4 4 0 100-8 4 4 0 000 8zm0 0v2m0 4h.01"
          />
        </svg>
        Registros de Scans
      </h1>
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  UID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fecha y Hora
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {scans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    No hay registros de scans.
                  </td>
                </tr>
              ) : (
                scans.map((scan, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-2 font-mono text-xs text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {scan.device_id}
                    </td>
                    <td className="px-4 py-2 font-mono text-sm text-gray-700">
                      {scan.uid ?? <span className="italic text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {new Date(scan.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex gap-4 mt-8">
        <button
          onClick={handleTestRFIDPost}
          className="px-5 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-semibold transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline-block mr-2 -mt-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m4 0h-1v-4h-1m4 0h-1v-4h-1"
            />
          </svg>
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
          className="px-5 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 font-semibold transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline-block mr-2 -mt-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Crear Usuarios de Prueba
        </button>
      </div>
    </div>
  );
}
