import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";

export async function POST() {
  try {
    const { db } = await connectToDatabase();

    // Create admin user
    const adminUser = {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123", // In a real app, hash this password
      role: "admin",
    };

    // Create test user
    const testUser = {
      name: "Test User",
      email: "test@example.com",
      password: "test123", // In a real app, hash this password
      role: "user",
    };

    // Insert users into the database
    await db.collection("users").insertMany([adminUser, testUser]);

    return NextResponse.json({ message: "Users created successfully" });
  } catch (error) {
    console.error("Error creating users:", error);
    return NextResponse.json({ error: "Failed to create users" }, { status: 500 });
  }
}
