"use client";
import { lusitana } from "@/app/ui/fonts";
import { InfoUsuario } from "@/app/ui/perfiles/infoUsuario";
import CrudProfiles from "./CrudProfiles";
import { useRouter } from "next/navigation";
import { useCurrentUserProfile } from "@/app/lib/userState";

export default function Page(props: {}) {
  const router = useRouter();
  const profile = useCurrentUserProfile();

  if (profile && profile.role !== "admin") {
    if (typeof window !== "undefined") {
      router.replace("/dashboard");
      return null;
    }
  }

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Perfiles</h1>
      </div>

      <div className="mb-6 p-6 bg-white shadow-md rounded-lg">
        <InfoUsuario />
      </div>

      <div className="p-6 bg-white shadow-md rounded-lg">
        <CrudProfiles />
      </div>
    </div>
  );
}
