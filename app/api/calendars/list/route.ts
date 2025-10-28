import { NextRequest, NextResponse } from "next/server";
import { connectFromRequest } from "@/app/lib/dbFromRequest";

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectFromRequest(req);
    const items = await db
      .collection("calendarios")
      .find({}, { projection: { name: 1 } })
      .sort({ name: 1 })
      .toArray();
    const names = items.map((i: any) => ({ name: i.name }));
    return NextResponse.json({ calendars: names });
  } catch (error) {
    console.error("GET /api/calendars/list error", error);
    return NextResponse.json({ error: "Error al listar calendarios" }, { status: 500 });
  }
}
