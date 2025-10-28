import { NextRequest, NextResponse } from "next/server";
import { connectFromRequest } from "@/app/lib/dbFromRequest";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }
  const { db } = await connectFromRequest(req);
    // Buscar el usuario en la colección profiles
    const user = await db.collection("profiles").findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    // Obtener los calendarIds del usuario
    const calendarIds = user.calendarIds || [];
    if (!Array.isArray(calendarIds) || calendarIds.length === 0) {
      return NextResponse.json({ calendarios: [] });
    }
    // Buscar los calendarios cuyos nombres estén en calendarIds
    const calendarios = await db
      .collection("calendarios")
      .find({ name: { $in: calendarIds } })
      .toArray();
    return NextResponse.json({ calendarios });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los calendarios" },
      { status: 500 }
    );
  }
}
