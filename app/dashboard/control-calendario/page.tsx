"use client";
import { useRouter } from "next/navigation";
import { useCurrentUserProfile } from "@/app/lib/userState";
import CrudCalendar from "@/app/componentes/CrudCalendar";

export default function Page() {
  const router = useRouter();
  const profile = useCurrentUserProfile();

  if (profile && profile.role !== "admin") {
    if (typeof window !== "undefined") {
      router.replace("/dashboard");
      return null;
    }
  }

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Control de calendario</h1>
      <CrudCalendar />
    </main>
  );
}
