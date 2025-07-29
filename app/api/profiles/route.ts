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
    const {
      name,
      email,
      password,
      role,
      matricula,
      carrera,
      grupo,
      rfids,
      calendarIds,
    } = await request.json();

    const { db } = await connectToDatabase();
    const newProfile = {
      id: new ObjectId().toString(),
      name,
      email,
      password,
      role,
      matricula,
      carrera,
      grupo,
      rfids,
      calendarIds,
    };

    await db.collection("profiles").insertOne(newProfile);
    return NextResponse.json({ message: "Profile created successfully" });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const { db } = await connectToDatabase();
    await db.collection("profiles").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, email, role } = await request.json();
    const { db } = await connectToDatabase();
    await db
      .collection("profiles")
      .updateOne({ _id: new ObjectId(id) }, { $set: { name, email, role } });
    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
