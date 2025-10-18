import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    // parse body once
    const body = await request.json();
    const { name, email, role, matricula, carrera, grupo, rfids, calendarIds, calendarNotificationMinutes } = body;
    const { db } = await connectToDatabase();
    await db.collection("profiles").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          email,
          role,
          matricula,
          carrera,
          grupo,
          rfids,
          calendarIds,
          calendarNotificationMinutes: typeof calendarNotificationMinutes === "number" ? calendarNotificationMinutes : null,
        },
      }
    );
    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    const { db } = await connectToDatabase();
    await db.collection("profiles").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
