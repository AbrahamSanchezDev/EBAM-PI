// lib/mongodb.js
import { MongoClient } from "mongodb";

// Lectura de URIs desde variables de entorno. Dejar placeholders en el .env
const MONGODB_URI_LOCAL = process.env.MONGODB_URI_LOCAL || process.env.MONGODB_URI || "mongodb://localhost:27017/rfid";
const MONGODB_URI_ATLAS = process.env.MONGODB_URI_ATLAS || ""; // dejar vacío en repo, rellenar en .env
const MONGODB_DB = process.env.MONGODB_DB || "BD";

// Cache de la conexión por URI para evitar múltiples conexiones redundantes
let cachedClients = {};
let cachedDbs = {};

/**
 * Conecta a la base de datos.
 * @param {{useAtlas?: boolean}} [options]
 */
export async function connectToDatabase(options = {}) {
  const useAtlas = Boolean(options.useAtlas);
  const uri = useAtlas ? (MONGODB_URI_ATLAS || MONGODB_URI_LOCAL) : MONGODB_URI_LOCAL;
  const cacheKey = uri + "::" + MONGODB_DB;

  if (cachedClients[cacheKey] && cachedDbs[cacheKey]) {
    return { client: cachedClients[cacheKey], db: cachedDbs[cacheKey] };
  }

  const client = new MongoClient(uri, {
    // opciones modernas, algunas propiedades permanecen para compatibilidad
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    await client.connect();
    console.log(`Conexión exitosa a MongoDB (${useAtlas ? "ATLAS" : "LOCAL"})`);

    const db = client.db(MONGODB_DB);

    // Configurar índices para mejor rendimiento (idempotente)
    try {
      await db.collection("scans").createIndex({ timestamp: -1 });
      await db.collection("scans").createIndex({ device_id: 1 });
    } catch (idxErr) {
      // No fatal: solo log
      console.warn("No se pudieron crear índices automáticamente:", idxErr);
    }

    cachedClients[cacheKey] = client;
    cachedDbs[cacheKey] = db;

    return { client, db };
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    throw new Error("No se pudo conectar a la base de datos");
  }
}

// Cerrar todas las conexiones cacheadas (útil para scripts/tests)
export async function closeDatabaseConnection() {
  const keys = Object.keys(cachedClients);
  for (const k of keys) {
    try {
      await cachedClients[k].close();
      delete cachedClients[k];
      delete cachedDbs[k];
    } catch (e) {
      console.warn("Error cerrando conexión:", e);
    }
  }
  console.log("Conexiones a MongoDB cerradas");
}
