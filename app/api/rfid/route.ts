import { NextResponse } from "next/server";
import { connectFromRequest } from "@/app/lib/dbFromRequest";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, device_id } = body;

    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "UID inválido" }, { status: 400 });
    }

  const { db } = await connectFromRequest(request);
    const result = await db.collection("scans").insertOne({
      uid,
      device_id,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Error en el endpoint RFID:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: String(error) },
      { status: 500 }
    );
  }
}
