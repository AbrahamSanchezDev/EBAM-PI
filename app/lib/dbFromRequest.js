import { connectToDatabase } from "./mongodb";

/**
 * Helper para conectar a la DB según la request.
 * Lee el header 'x-use-atlas' o la cookie 'use_atlas=1'.
 * Si no se pasa req, retorna la conexión por defecto (local).
 */
export async function connectFromRequest(req) {
  if (!req) {
    return await connectToDatabase();
  }

  // headers puede venir como NextRequest o Request
  const headerValue = req.headers && typeof req.headers.get === "function" ? req.headers.get("x-use-atlas") : undefined;
  const cookieHeader = req.headers && typeof req.headers.get === "function" ? req.headers.get("cookie") || "" : "";

  const useAtlasFromHeader = headerValue === "1" || headerValue === "true";
  const useAtlasFromCookie = /use_atlas=1/.test(cookieHeader);

  const useAtlas = useAtlasFromHeader || useAtlasFromCookie;

  return await connectToDatabase({ useAtlas });
}

export default connectFromRequest;
