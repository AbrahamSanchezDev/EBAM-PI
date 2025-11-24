"use client";
import { lusitana } from "@/app/ui/fonts";
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Button } from "./button";
import { useActionState } from "react";
import { authenticateUser } from "@/app/lib/actions";
import { useSearchParams } from "next/navigation";
import { useState, startTransition } from "react";
import { setCurrentUser } from "@/app/lib/userState";

export default function LoginForm() {
  // Siempre redirigir a /dashboard después de login
  const callbackUrl = "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFormAction = async () => {
    try {
      // Client-side basic validation to avoid sending malformed payloads.
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.trim())) {
        setErrorMessage("Por favor ingresa un correo válido.");
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      // Client-side password sanitation: disallow control chars, quotes, semicolon and backslash
      const passwordRegex = /^[^\x00-\x1F'";\\]+$/;
      if (!passwordRegex.test(password)) {
        setErrorMessage("La contraseña contiene caracteres inválidos.");
        return;
      }

      const user = await authenticateUser({ email: email.trim(), password });
      // If the authenticate endpoint returns features, persist them
      const features = user?.features || null;
      setCurrentUser(email.trim(), features);
      window.location.href = callbackUrl;
    } catch (error: any) {
      setErrorMessage(error?.message || "Ocurrió un error inesperado");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => {
          handleFormAction();
        });
      }}
      className="space-y-3"
    >
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Inicia sesión para continuar
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Correo
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <Button className="mt-4 w-full" aria-disabled={false}>
          Iniciar sesión <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
