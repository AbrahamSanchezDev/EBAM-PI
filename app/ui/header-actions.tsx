"use client";
import React, { useEffect, useState } from "react";
import Bell from "@/app/ui/bell";
import RequestsMount from "@/app/ui/requests/RequestsMount";
import { getCurrentUser } from "@/app/lib/userState";

export default function HeaderActions() {
  // Render null on server and on initial client render to avoid hydration mismatches.
  // Then populate the user after the component mounts on the client.
  const [user, setUser] = useState<string | null>(null);
  useEffect(() => {
    try {
      const u = getCurrentUser();
      setUser(u);
    } catch (e) {
      setUser(null);
    }
  }, []);

  if (!user) return null;
  return (
    <div className="flex items-center gap-3">
      <Bell />
      <RequestsMount />
    </div>
  );
}
