import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { createUser } from "@/app/models/user";

export async function POST() {
  try {
    const { db } = await connectToDatabase();

    // Create admin user
    const adminUser = createUser(
      "Admin User",
      "admin@example.com",
      "admin123",
      "admin"
    );

    // Create test user
    const testUser = createUser("Test User", "test@example.com", "test123", "user");

    // Insert users into the database
    await db.collection("users").insertMany([adminUser, testUser]);

    return NextResponse.json({ message: "Users created successfully" });
  } catch (error) {
    console.error("Error creating users:", error);
    return NextResponse.json({ error: "Failed to create users" }, { status: 500 });
  }
}
