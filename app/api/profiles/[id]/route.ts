import { NextResponse } from "next/server";
import { connectFromRequest } from "@/app/lib/dbFromRequest";
import { ObjectId } from "mongodb";

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    // parse body once
    const body = await request.json();
  const { db } = await connectFromRequest(request);

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

    // Fetch updated document to include identifying info in the broadcast
    const updated = await db.collection("profiles").findOne({ _id: new ObjectId(id) });
    try {
      const { publish } = await import("@/app/lib/broadcaster");
      // sanitize updated doc before broadcasting (remove sensitive fields)
      const { password, ...safe } = (updated || {}) as any;
      // publish the updated profile so clients can react if it's them
      publish("profile-updated", { id, email: safe.email || null, updated: safe, updatedFields: updateFields });

      // If features were changed, create a notification for the user and publish it as well
      if (Object.prototype.hasOwnProperty.call(updateFields, "features") && safe.email) {
        try {
          const note = {
            to: safe.email,
            from: "Sistema",
            message: "Tus permisos (features) han sido actualizados por un administrador.",
            createdAt: new Date(),
            data: { updatedFeatures: updateFields.features },
          } as any;
          // store notification in DB
          await db.collection("notifications").insertOne(note);
          // publish a notification-created event
          publish("notification-created", note);
        } catch (e) {
          console.warn("Failed to create/publish notification for feature change", e);
        }
      }
    } catch (e) {
      console.warn("Failed to publish profile-updated event", e);
    }

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
  const { db } = await connectFromRequest(request);
    await db.collection("profiles").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
