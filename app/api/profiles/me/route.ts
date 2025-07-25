import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectToDatabase } from "../../../lib/mongodb";

export async function GET(req: Request) {
  try {
    // Obtén el token del usuario autenticado (ajusta según tu sistema de auth)
    const token = await getToken({ req });
    if (!token || !token.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("profiles").findOne({ email: token.email });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Opcional: elimina campos sensibles
    delete user.password;

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
