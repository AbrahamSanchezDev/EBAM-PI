import { NextRequest, NextResponse } from "next/server";
import { connectFromRequest } from "@/app/lib/dbFromRequest";
import { ObjectId } from "mongodb";
import { publish } from "@/app/lib/broadcaster";

export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get("name");
    if (!name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }
  const { db } = await connectFromRequest(req);
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

  const { db } = await connectFromRequest(req);

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
      const notifications: any[] = users.map((u: any) => ({
        id: new ObjectId().toString(),
        to: u.email,
        from: "system",
        message: `El calendario \"${name}\" ha sido modificado.`,
        createdAt: new Date().toISOString(),
        read: false,
      }));
      await Promise.all(
        notifications.map(async (note: any) => {
          const r = await db.collection("profiles").updateOne(
            { email: note.to },
            { $push: { notifications: { $each: [note], $position: 0 } } }
          );
          if (r.matchedCount > 0) notifiedCount++;
          try {
            publish("notification-created", note);
          } catch (e) {}
        })
      );
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
