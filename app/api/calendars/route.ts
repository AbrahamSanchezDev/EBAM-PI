export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get("name");
    if (!name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }
    const { db } = await connectToDatabase();
    const result = await db.collection("calendarios").findOne({ name });
    if (!result) {
      return NextResponse.json(
        { error: "Calendario no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ events: result.events, name: result.name });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener el calendario" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, events } = body;
    if (!name || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "Nombre y eventos requeridos" },
        { status: 400 }
      );
    }
    const { db } = await connectToDatabase();
    const result = await db
      .collection("calendarios")
      .updateOne({ name }, { $set: { name, events } }, { upsert: true });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al guardar el calendario" },
      { status: 500 }
    );
  }
}
