"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    // We'll log the error to the console for now
    console.error(error);
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
export async function deleteInvoice(id: string) {
  throw new Error("Failed to Delete Invoice");

  // Unreachable code block
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
// Determine an API base URL depending on runtime:
// - In the browser (client) we can use relative paths (""),
// - On the server we need an absolute URL for fetch(), so prefer NEXT_PUBLIC_API_BASE_URL,
//   otherwise use VERCEL_URL (auto-provided on Vercel) or localhost fallback.
const getApiBaseUrl = () => {
  // client-side (browser)
  if (typeof window !== "undefined") return "";

  // server-side: prefer explicit public URL
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") return envUrl.replace(/\/$/, "");

  // Vercel exposes VERCEL_URL (e.g. my-app.vercel.app)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;

  // local fallback
  const port = process.env.PORT || "3000";
  return `http://localhost:${port}`;
};

export async function authenticateUser(
  params: { email?: string; password?: string } = {}
) {
  "use server";

  const { email, password } = params;

  // Server-side validation before sending to the authenticate endpoint.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    throw new Error("Email inválido o faltante");
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    throw new Error("Contraseña inválida o demasiado corta (mínimo 6 caracteres)");
  }

  const sanitizedEmail = email.trim();

  // Basic password sanitation: disallow control characters, quotes, semicolon and backslash
  const passwordRegex = /^[^\x00-\x1F'";\\]+$/;
  if (!passwordRegex.test(password)) {
    throw new Error("Contraseña contiene caracteres inválidos");
  }

  const base = getApiBaseUrl();
  let url: string;
  if (typeof window === "undefined") {
    // Server runtime: ensure we always use an absolute URL for fetch
    const resolvedBase = base && base.trim() !== "" ? base : `http://localhost:${process.env.PORT || "3000"}`;
    url = `${resolvedBase.replace(/\/$/, "")}/api/authenticate`;
  } else {
    // Browser: relative path is fine
    url = `/api/authenticate`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Send sanitized primitives only
    body: JSON.stringify({ email: sanitizedEmail, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Authentication failed");
  }

  // Esperar el usuario y/o redirectTo
  const data = await response.json();
  // Si el backend solo manda redirectTo, hay que ajustarlo para mandar el usuario también
  if (data.user) {
    return data.user;
  }
  // fallback: si solo hay redirectTo, regresar el objeto completo
  return data;
}
