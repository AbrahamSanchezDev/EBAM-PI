import { NextResponse } from "next/server";

export async function GET() {
  // Devuelve texto simple para verificar que las APIs funcionan en Vercel
  return new Response("FUNCIONA!", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
