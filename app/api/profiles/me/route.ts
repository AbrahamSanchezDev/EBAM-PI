import { connectToDatabase } from "../../../lib/mongodb";

export async function GET(req: Request) {
  try {
    // Obtener el email del usuario desde el header o query param
    const url = new URL(req.url);
    const email = req.headers.get("x-user-email") || url.searchParams.get("email");
    console.log("email:", email);
    if (!email) {
      return new Response(
        JSON.stringify({
          error: "No autenticado por que no hay email " + email + " ... ",
        }),
        {
          status: 401,
        }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("profiles").findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 404,
      });
    }

    // Opcional: elimina campos sensibles
    delete user.password;

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error interno" }), { status: 500 });
  }
}
