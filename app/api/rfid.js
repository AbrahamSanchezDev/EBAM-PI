// pages/api/rfid.js
import { connectFromRequest } from "../lib/dbFromRequest";

export default async function handler(req, res) {
  try {
  const { db } = await connectFromRequest(req);

    // Endpoint POST - Registrar nuevo escaneo RFID
    if (req.method === "POST") {
      const { uid, device_id = null } = req.body;

      // Validación básica
      if (!uid || typeof uid !== "string") {
        return res.status(400).json({ error: "UID inválido" });
      }

      // Insertar en MongoDB
      const result = await db.collection("scans").insertOne({
        uid,
        device_id,
        timestamp: new Date(),
      });

      return res.status(201).json({
        success: true,
        insertedId: result.insertedId,
      });

      // Endpoint GET - Obtener últimos escaneos
    } else if (req.method === "GET") {
      const limit = parseInt(req.query.limit) || 20;
      const deviceFilter = req.query.device_id
        ? { device_id: req.query.device_id }
        : {};

      const scans = await db
        .collection("scans")
        .find(deviceFilter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return res.status(200).json(scans);

      // Método no soportado
    } else {
      return res.status(405).json({ error: "Método no permitido" });
    }
  } catch (error) {
    console.error("Error en el endpoint RFID:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    });
  }
}
