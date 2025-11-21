// lib/mongodb.js
import { MongoClient } from "mongodb";

// Lectura de URIs desde variables de entorno. Dejar placeholders en el .env
const MONGODB_URI_LOCAL = process.env.MONGODB_URI_LOCAL || "mongodb://localhost:27017/rfid";
const MONGODB_URI_ATLAS = process.env.MONGODB_URI_ATLAS || ""; // dejar vacío en repo, rellenar en .env
// `MONGODB_URI` es la forma recomendada: si está definida la usamos siempre (por ejemplo en Vercel)
const MONGODB_URI = process.env.MONGODB_URI || "";
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

  // Determine environment flags
  const isProduction = process.env.VERCEL === "1" || !!process.env.VERCEL_URL || process.env.NODE_ENV === "production";
  const DEFAULT_USE_ATLAS = String(process.env.MONGODB_DEFAULT_USE_ATLAS || "false").toLowerCase() === "true";

  // Decide source preference:
  // - In production (Vercel) prefer MONGODB_URI_ATLAS if available (common deployment pattern).
  // - Otherwise prefer explicit MONGODB_URI if provided.
  let chosenSource = null;
  let chosenUri = "";

  if (isProduction && MONGODB_URI_ATLAS) {
    chosenSource = "MONGODB_URI_ATLAS";
    chosenUri = MONGODB_URI_ATLAS;
  } else if (MONGODB_URI) {
    chosenSource = "MONGODB_URI";
    chosenUri = MONGODB_URI;
  } else if (useAtlas && MONGODB_URI_ATLAS) {
    chosenSource = "MONGODB_URI_ATLAS";
    chosenUri = MONGODB_URI_ATLAS;
  } else if (DEFAULT_USE_ATLAS && MONGODB_URI_ATLAS) {
    chosenSource = "MONGODB_URI_ATLAS";
    chosenUri = MONGODB_URI_ATLAS;
  } else {
    chosenSource = "MONGODB_URI_LOCAL";
    chosenUri = MONGODB_URI_LOCAL;
  }

  // If running in production / Vercel and no production URI is provided, fail fast
  if (isProduction && chosenSource === "MONGODB_URI_LOCAL") {
    console.error("Falta MONGODB_URI_ATLAS (o MONGODB_URI) en entorno de producción. Configure la variable de entorno en Vercel.");
    throw new Error("MONGODB URI de producción no configurada. Configure 'MONGODB_URI' o 'MONGODB_URI_ATLAS' en su hosting.");
  }

  // Extract host(s) portion for safe logging (strip credentials and DB path)
  let hostLabel = "unknown";
  try {
    // Remove protocol
    const afterProto = chosenUri.replace(/^.*?:\/\//, "");
    // Remove credentials if present (user:pass@)
    const noCreds = afterProto.includes("@") ? afterProto.split("@").pop() : afterProto;
    // Host is up to the first '/' (which starts the DB/path)
    hostLabel = noCreds.split("/")[0];
  } catch (e) {
    hostLabel = "unknown";
  }

  console.log("Conectando a MongoDB usando fuente:", chosenSource, "host:", hostLabel);

  const uriToUse = chosenUri;
  const cacheKey = uriToUse + "::" + MONGODB_DB;

  if (cachedClients[cacheKey] && cachedDbs[cacheKey]) {
    return { client: cachedClients[cacheKey], db: cachedDbs[cacheKey] };
  }

  // El driver moderno ignora `useNewUrlParser` y `useUnifiedTopology` (deprecated).
  // Mantener timeouts útiles y familia IPv4 preferida si se desea.
  const client = new MongoClient(uriToUse, {
    serverSelectionTimeoutMS: 10000,
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
    console.error("Error al conectar a MongoDB: -- ", error);
    throw new Error("No se pudo conectar a la base de datos :... ", error);
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
