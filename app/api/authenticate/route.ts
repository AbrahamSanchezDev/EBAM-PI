import { NextResponse } from "next/server";
import { connectFromRequest } from "@/app/lib/dbFromRequest";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = typeof body?.email === "string" ? body.email.trim() : undefined;
    const password = typeof body?.password === "string" ? body.password : undefined;

    // Basic validation to avoid NoSQL/SQL injection-like payloads.
    // Require email to be a string and match a simple email regex.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ message: "Email inválido" }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ message: "Contraseña inválida" }, { status: 400 });
    }

    // Password character whitelist: reject control chars, single/double quotes, semicolon and backslash
    const passwordRegex = /^[^\x00-\x1F'";\\]+$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ message: "Contraseña contiene caracteres inválidos" }, { status: 400 });
    }

    const { db } = await connectFromRequest(request);
    // Use the validated `email` (string) to avoid query operator injection.
    const user = await db.collection("profiles").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Don't log passwords. Support hashed passwords when present.
    let isPasswordValid = false;
    try {
      if (typeof user.password === "string") {
        // If password looks like a bcrypt hash, use bcrypt.compare
        if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")) {
          isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
          // Fallback to plain comparison (existing data might be plaintext) - consider migrating to hashed passwords.
          isPasswordValid = password === user.password;
        }
      }
    } catch (err) {
      console.error("Error validating password:", err);
      return NextResponse.json({ message: "Error durante la autenticación" }, { status: 500 });
    }
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          message: "Contraseña incorrecta",
        },
        { status: 401 }
      );
    }

    // Eliminar la contraseña antes de enviar el usuario al frontend
    const { password: _, ...userWithoutPassword } = user;

    // Attach features (from DB if present, otherwise default per role)
    const { defaultFeaturesForRole } = await import("@/app/lib/featureFlags");
    const features = user.features || defaultFeaturesForRole(user.role);

    return NextResponse.json({
      redirectTo: "/dashboard",
      user: { ...userWithoutPassword, features },
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
