import { connectToDatabase } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const scans = await db.collection("scans").find({}).toArray();
    return NextResponse.json(scans);
  } catch (error) {
    console.error("Error fetching scans:", error);
    return NextResponse.json(
      { error: "No se pudo conectar a la base de datos" },
      { status: 500 }
    );
  }
}
