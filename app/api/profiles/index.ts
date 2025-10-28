import { NextResponse } from "next/server";
import { connectFromRequest } from "@/app/lib/dbFromRequest";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { db } = await connectFromRequest(request);
    const profiles = await db.collection("profiles").find().toArray();
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, role, matricula, carrera, grupo, calendarNotificationMinutes } = await request.json();
    const { db } = await connectFromRequest(request);
    const newProfile = {
      id: new ObjectId().toString(),
      name,
      email,
      role,
      matricula,
      carrera,
      grupo,
      calendarNotificationMinutes: typeof calendarNotificationMinutes === 'number' ? calendarNotificationMinutes : null,
    };
    await db.collection("profiles").insertOne(newProfile);
    return NextResponse.json({ message: "Profile created successfully" });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
