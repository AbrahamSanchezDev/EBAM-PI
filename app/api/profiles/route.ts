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
      calendarNotificationMinutes,
      features,
    } = await request.json();

    const { db } = await connectFromRequest(request);
    // Check if email already exists (case-insensitive)
    if (email) {
      const escaped = email.toString().replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const existing = await db.collection("profiles").findOne({ email: { $regex: `^${escaped}$`, $options: 'i' } });
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
    }
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
      calendarNotificationMinutes: typeof calendarNotificationMinutes === 'number' ? calendarNotificationMinutes : null,
      features: Array.isArray(features) ? features : null,
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
    const { db } = await connectFromRequest(request);
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
    const { db } = await connectFromRequest(request);
    // If email is being changed, ensure no other profile has the same email
    if (email) {
      const escaped = email.toString().replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const conflict = await db.collection("profiles").findOne({ email: { $regex: `^${escaped}$`, $options: 'i' }, _id: { $ne: new ObjectId(id) } });
      if (conflict) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
    }
    await db
      .collection("profiles")
      .updateOne({ _id: new ObjectId(id) }, { $set: { name, email, role } });
    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
