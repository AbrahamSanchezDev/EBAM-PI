import { NextRequest, NextResponse } from "next/server";
import { connectFromRequest } from "@/app/lib/dbFromRequest";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }
  const { db } = await connectFromRequest(req);
    // Buscar el usuario y sus RFIDs
    const user = await db.collection("profiles").findOne({ email });
    if (!user || !user.rfids || user.rfids.length === 0) {
      return NextResponse.json({ scans: [] });
    }
    const rfidIds = user.rfids.map((r: any) => r.id);
    // Buscar los scans que tengan un uid en los RFIDs del usuario
    const scans = await db
      .collection("scans")
      .find({ uid: { $in: rfidIds } })
      .toArray();
    return NextResponse.json({ scans });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los scans" },
      { status: 500 }
    );
  }
}
