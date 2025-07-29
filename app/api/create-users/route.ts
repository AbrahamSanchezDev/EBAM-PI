import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { createProfile } from "@/app/models/user";

export async function POST() {
  try {
    const { db } = await connectToDatabase();

    // Create admin user
    const adminUser = createProfile(
      "Admin User",
      "admin@example.com",
      "admin123",
      "admin",
      "123456",
      "Computer Science",
      "A1",
      [{ id: "rfid1", active: true }],
      ["calendar1"]
    );

    // Create test user
    const testUser = createProfile(
      "Test User",
      "test@example.com",
      "test123",
      "user",
      "123456",
      "Computer Science",
      "A1",
      [{ id: "rfid1", active: true }],
      ["calendar1"]
    );

    // Insert users into the database
    await db.collection("profiles").insertMany([adminUser, testUser]);

    return NextResponse.json({ message: "Users created successfully" });
  } catch (error) {
    console.error("Error creating users:", error);
    return NextResponse.json({ error: "Failed to create users" }, { status: 500 });
  }
}
