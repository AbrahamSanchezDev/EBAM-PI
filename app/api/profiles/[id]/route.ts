import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    // parse body once
    const body = await request.json();
    const { db } = await connectToDatabase();

    // Build a partial $set document only with fields that exist in the request body
    const updateFields: any = {};
    if (Object.prototype.hasOwnProperty.call(body, "name")) updateFields.name = body.name;
    if (Object.prototype.hasOwnProperty.call(body, "email")) updateFields.email = body.email;
    if (Object.prototype.hasOwnProperty.call(body, "role")) updateFields.role = body.role;
    if (Object.prototype.hasOwnProperty.call(body, "matricula")) updateFields.matricula = body.matricula;
    if (Object.prototype.hasOwnProperty.call(body, "carrera")) updateFields.carrera = body.carrera;
    if (Object.prototype.hasOwnProperty.call(body, "grupo")) updateFields.grupo = body.grupo;
    if (Object.prototype.hasOwnProperty.call(body, "rfids")) updateFields.rfids = body.rfids;
    if (Object.prototype.hasOwnProperty.call(body, "calendarIds")) updateFields.calendarIds = body.calendarIds;
    if (Object.prototype.hasOwnProperty.call(body, "calendarNotificationMinutes")) {
      const v = body.calendarNotificationMinutes;
      updateFields.calendarNotificationMinutes = typeof v === "number" ? v : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "features")) {
      updateFields.features = Array.isArray(body.features) ? body.features : null;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ message: "No fields to update" });
    }

    await db.collection("profiles").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
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
