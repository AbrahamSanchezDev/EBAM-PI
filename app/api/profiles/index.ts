import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const profiles = await db.collection("profiles").find().toArray();
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, role, matricula, carrera, grupo } = await request.json();
    const { db } = await connectToDatabase();
    const newProfile = {
      id: new ObjectId().toString(),
      name,
      email,
      role,
      matricula,
      carrera,
      grupo,
    };
    await db.collection("profiles").insertOne(newProfile);
    return NextResponse.json({ message: "Profile created successfully" });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
