"use client";
import React from "react";
import { useEffect, useState } from "react";
type DebugModalProps = {
  open: boolean;
  onClose: () => void;
  onTestRFID: () => void;
  onCreateUsers: () => void;
};

function DebugModal({ open, onClose, onTestRFID, onCreateUsers }: DebugModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-yellow-500 to-amber-400">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-black text-2xl font-bold">!</span>
          </div>
          <div>
            <h3 className="text-black text-lg font-bold">Debugeo</h3>
            <p className="text-black text-sm">Herramientas de prueba para RFID y usuarios</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <button
            onClick={onTestRFID}
            className="w-full px-5 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-semibold transition"
          >
            Ejecutar Prueba RFID
          </button>
          <button
            onClick={onCreateUsers}
            className="w-full px-5 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700 font-semibold transition"
          >
            Crear Usuarios de Prueba
          </button>
          <button
            onClick={onClose}
            className="w-full px-5 py-3 bg-gray-400 text-white rounded shadow hover:bg-gray-500 font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
import { useRouter } from "next/navigation";
import { useCurrentUserProfile } from "@/app/lib/userState";

interface PrintModalProps {
  open: boolean;
  onClose: () => void;
  scans: Scan[];
  onPrint: (selectedIdxs: number[]) => void;
}

function PrintModal({ open, onClose, scans, onPrint }: PrintModalProps) {
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (!open) setSelected([]);
  }, [open]);

  const toggleSelect = (idx: number) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100/80 via-white/90 to-blue-200/80">
      <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-2xl border border-blue-100">
        <div className="flex items-center gap-3 px-6 py-4 rounded-t-2xl bg-gradient-to-r from-blue-400 to-blue-400">
          <svg
            className="h-7 w-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8V6a4 4 0 10-8 0v2M5 8h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Imprime los registros de scans
          </h2>
        </div>
        <div className="overflow-x-auto max-h-80 mb-4 px-6 pt-4">
          <table className="min-w-full divide-y divide-blue-200 rounded-xl overflow-hidden shadow">
            <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
              <tr>
                <th></th>
                <th className="px-2 py-2 text-xs font-bold text-blue-800 uppercase">
                  Dispositivo
                </th>
                <th className="px-2 py-2 text-xs font-bold text-blue-800 uppercase">
                  UID
                </th>
                <th className="px-2 py-2 text-xs font-bold text-blue-800 uppercase">
                  Fecha y Hora
                </th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan: Scan, idx: number) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/60"}
                >
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(idx)}
                      onChange={() => toggleSelect(idx)}
                      className="accent-blue-600 w-4 h-4 rounded focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                  <td className="px-2 py-2 font-medium text-blue-900">
                    {scan.device_id}
                  </td>
                  <td className="px-2 py-2">
                    {scan.uid ? (
                      <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 tracking-wider shadow-sm font-mono text-xs">
                        {scan.uid}
                      </span>
                    ) : (
                      <span className="italic text-blue-300">-</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-blue-800 font-medium">
                    {new Date(scan.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 px-6 pb-6">
          <button
            className="px-4 py-2 bg-gray-100 text-blue-700 rounded-lg font-semibold hover:bg-gray-200 border border-gray-200 shadow-sm transition"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => onPrint(selected)}
            disabled={selected.length === 0}
          >
            <svg
              className="inline-block w-5 h-5 mr-1 -mt-1 align-middle"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 9v6a2 2 0 002 2h8a2 2 0 002-2V9M6 9V7a2 2 0 012-2h8a2 2 0 012 2v2M6 9h12"
              />
            </svg>
            Imprimir Seleccionados
          </button>
        </div>
      </div>
    </div>
  );
}

interface Scan {
  device_id: string;
  timestamp: string;
  uid?: string;
}

export default function ScansPage() {
  const router = useRouter();
  const profile = useCurrentUserProfile();


  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [scans, setScans] = useState<Scan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugModalOpen, setDebugModalOpen] = useState(false);
  // Search/filter state
  const [searchUid, setSearchUid] = useState("");
  const [filteredScans, setFilteredScans] = useState<Scan[]>([]);

  // Imprimir los registros seleccionados
  const handlePrint = (selectedIdxs: number[]) => {
    const selectedScans = filteredScans.filter((_, idx) =>
      selectedIdxs.includes(idx)
    );
    const printWindow = window.open("", "", "width=900,height=700");
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Impresión de Registros</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 32px; }
            .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
            .logo { height: 48px; }
            .title { font-size: 2rem; font-weight: 700; color: #2563eb; }
            .subtitle { color: #64748b; font-size: 1.1rem; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; background: #fff; box-shadow: 0 2px 8px #0001; }
            th, td { border: 1px solid #e5e7eb; padding: 12px 10px; text-align: left; }
            th { background: #f1f5f9; color: #1e293b; font-size: 1rem; font-weight: 600; }
            tr:nth-child(even) { background: #f8fafc; }
            tr:hover { background: #e0e7ff; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${
              window.location.origin
            }/logo%202.png" class="logo" alt="Logo" />
            <span class="title">Registros de Scans Seleccionados</span>
          </div>
          <div class="subtitle">Fecha de impresión: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th>Dispositivo</th>
                <th>UID</th>
                <th>Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              ${selectedScans
                .map(
                  (scan) => `
                <tr>
                  <td>${scan.device_id}</td>
                  <td>${scan.uid ?? "-"}</td>
                  <td>${new Date(scan.timestamp).toLocaleString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    setPrintModalOpen(false);
  };

  // Redirect non-admin users. Keep hooks unconditional by performing redirect inside useEffect
  useEffect(() => {
    if (profile && profile.role !== "admin") {
      if (typeof window !== "undefined") {
        router.replace("/dashboard");
      }
    }
  }, [profile, router]);

  // Filtering logic
  useEffect(() => {
    if (searchUid.trim() === "") {
      setFilteredScans(scans);
    } else {
      setFilteredScans(
        scans.filter((scan) =>
          scan.uid?.toLowerCase().includes(searchUid.trim().toLowerCase())
        )
      );
    }
  }, [searchUid, scans]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div className="flex items-center gap-2">
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
          <span className="text-3xl font-extrabold">Registros de Scans</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative flex items-center">
            <span className="absolute left-2 text-gray-400 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por UID..."
              value={searchUid}
              onChange={(e) => setSearchUid(e.target.value)}
              className="border border-gray-300 rounded-l px-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[180px]"
              style={{ minWidth: 180 }}
            />
            <button
              onClick={() => setSearchUid("")}
              className={
                `px-4 py-2 rounded-r font-bold text-white text-sm transition-all duration-150 border-l border-blue-400 shadow-md ` +
                (searchUid.trim() === ""
                  ? "bg-gradient-to-r from-blue-500 to-blue-500 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-400")
              }
              disabled={searchUid.trim() === ""}
              style={{ marginLeft: "-1px" }}
            >
              <svg
                className="inline-block w-4 h-4 mr-1 -mt-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
              </svg>
              Mostrar todos
            </button>
          </div>
        </div>
      </div>
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
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    No hay registros de scans.
                  </td>
                </tr>
              ) : (
                filteredScans.map((scan, index) => (
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
          onClick={() => setPrintModalOpen(true)}
          className="px-5 py-2 bg-gray-700 text-white rounded shadow hover:bg-gray-900 font-semibold transition"
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
          Imprimir Registros
        </button>
        <PrintModal
          open={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          scans={filteredScans}
          onPrint={handlePrint}
        />
        <button
          onClick={() => setDebugModalOpen(true)}
          className="px-5 py-2 bg-gray-800 text-white rounded shadow hover:bg-gray-900 font-semibold transition"
        >
          Debugeo
        </button>
        <DebugModal
          open={debugModalOpen}
          onClose={() => setDebugModalOpen(false)}
          onTestRFID={handleTestRFIDPost}
          onCreateUsers={async () => {
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
        />
      </div>
    </div>
  );
}
