"use client";
import React from "react";
import Bell from "@/app/ui/bell";
import RequestsMount from "@/app/ui/requests/RequestsMount";
import { getCurrentUser } from "@/app/lib/userState";

export default function HeaderActions() {
  const user = getCurrentUser();
  if (!user) return null;
  return (
    <div className="flex items-center gap-3">
      <Bell />
      <RequestsMount />
    </div>
  );
}
