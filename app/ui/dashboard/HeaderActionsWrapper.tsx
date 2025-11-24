"use client";
import HeaderActions from "@/app/ui/header-actions";
import { usePathname } from "next/navigation";
export default function HeaderActionsWrapper() {
  const pathname = usePathname();
  // Ocultar en página principal y login
  if (pathname === "/" || pathname === "/login") return null;
  return (
    <div className="w-full bg-white border-b p-3 flex justify-end items-center gap-3">
      <HeaderActions />
    </div>
  );
}