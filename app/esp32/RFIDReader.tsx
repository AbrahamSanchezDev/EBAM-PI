// pages/index.js
"use client";
import { da } from "date-fns/locale";
import { useState, useEffect } from "react";

export default function RFIDReader() {
  const [rfData, setRfData] = useState("Esperando datos...");
  const [rfUid, setRfUid] = useState("");
  const [esp32IP, setEsp32IP] = useState("192.168.2.185"); // Cambia por la IP de tu ESP32

  const [lastHourStamp, setLastHourStamp] = useState("");
  const [lastDateStamp, setLastDateStamp] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/esp32");
        const data = await response.json();
        if (data.fecha_hora != rfData) {
          setRfData(data.fecha_hora || "Esperando datos...");
          setRfUid(data.uid || "No ID");
          const currentDate = new Date();
          // Actualizar las marcas de tiempo
          const formattedTime = currentDate.toLocaleTimeString();
          const formattedDate = currentDate.toLocaleDateString();
          setLastHourStamp(formattedTime);
          setLastDateStamp(formattedDate);
          console.log("Updated data:", data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setRfData("Error de conexión");
      }
    };

    const interval = setInterval(fetchData, 1000); // Polling cada 1 segundo
    return () => clearInterval(interval);
  }, [rfData, esp32IP]);

  return (
    <div className="container">
      <h1>Lector RFID en Tiempo Real</h1>
      <div className="card">
        <h2>Datos de Lectura:</h2>
        <p className="data">card: {rfUid}</p>
        <p className="time">
          time: {lastDateStamp} {lastHourStamp}
        </p>
      </div>
      <style jsx>{`
        .container {
          padding: 2rem;
          text-align: center;
        }
        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 2rem;
          margin: 2rem auto;
          max-width: 500px;
        }
        .data {
          font-size: 1.5rem;
          color: #0070f3;
          font-weight: bold;
        }
        .time {
          font-size: 1rem;
          color: #555;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
