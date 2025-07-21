import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name, email, role, matricula, carrera, grupo } = await request.json();
    const { db } = await connectToDatabase();
    await db
      .collection("profiles")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { name, email, role, matricula, carrera, grupo } }
      );
    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { db } = await connectToDatabase();
    await db.collection("profiles").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
