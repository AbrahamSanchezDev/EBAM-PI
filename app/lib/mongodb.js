// lib/mongodb.js
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rfid";
const MONGODB_DB = process.env.MONGODB_DB || "rfid";

// Cache de la conexión para evitar múltiples conexiones
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 10000, // 10 segundos de timeout
    socketTimeoutMS: 45000, // 45 segundos de timeout
  });

  try {
    await client.connect();
    console.log("Conexión exitosa a MongoDB");

    const db = client.db(MONGODB_DB);

    // Configurar índices para mejor rendimiento
    await db.collection("scans").createIndex({ timestamp: -1 });
    await db.collection("scans").createIndex({ device_id: 1 });

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    throw new Error("No se pudo conectar a la base de datos");
  }
}

// Función para cerrar la conexión (opcional, útil para scripts)
export async function closeDatabaseConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log("Conexión a MongoDB cerrada");
  }
}
