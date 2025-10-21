import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";

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
    console.error("GET /api/calendars error", error);
    return NextResponse.json(
      { error: "Error al obtener el calendario" },
      { status: 500 }
    );
  }
}

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

    // Upsert calendario
    const result = await db
      .collection("calendarios")
      .updateOne({ name }, { $set: { name, events } }, { upsert: true });

    // Buscar usuarios que tengan este calendario en su calendarIds
    const users = await db
      .collection("profiles")
      .find({ calendarIds: { $in: [name] } })
      .toArray();

    let notifiedCount = 0;
    if (users.length > 0) {
      const notifications = users.map((u: any) => ({
        to: u.email,
        from: "system",
        message: `El calendario \"${name}\" ha sido modificado.`,
        createdAt: new Date(),
        read: false,
      }));
      const insertRes = await db
        .collection("notifications")
        .insertMany(notifications);
      notifiedCount = insertRes.insertedCount || 0;

      // ensure indexes exist (idempotent)
      await db.collection("notifications").createIndex({ to: 1, read: 1 });
      await db.collection("notifications").createIndex({ createdAt: -1 });
    }

    return NextResponse.json({ ok: true, result, notifiedCount });
  } catch (error) {
    console.error("POST /api/calendars error", error);
    return NextResponse.json(
      { error: "Error al guardar el calendario" },
      { status: 500 }
    );
  }
}
