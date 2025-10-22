import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const { db } = await connectToDatabase();
    const user = await db.collection("profiles").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    console.log("Password ingresado:", password);
    console.log("Password del usuario :", user.password);

    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === user.password; // For simplicity, using plain text comparison
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
