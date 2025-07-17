import { NextResponse } from "next/server";
import testRFIDPost from "../rfid";

export async function POST() {
  try {
    const result = await testRFIDPost();

    if (!result.success) {
      console.error("Error en testRFIDPost:", result.error);
      return NextResponse.json(
        { error: "Error al ejecutar la prueba RFID", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en el endpoint de prueba RFID:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: String(error) },
      { status: 500 }
    );
  }
}
