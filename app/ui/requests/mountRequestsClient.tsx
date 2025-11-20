"use client";
import React from "react";
import { createRoot } from "react-dom/client";
import { RequestsProvider } from "@/app/lib/requestsClient";
import RequestsIcon from "@/app/ui/requests/requests-icon";
import { useCurrentUserProfile } from "@/app/lib/userState";

function App() {
  const profile = useCurrentUserProfile();
  if (!profile || profile.role !== "admin") return null;
  return (
    <RequestsProvider>
      <RequestsIcon />
    </RequestsProvider>
  );
}

const mount = () => {
  try {
    const root = document.getElementById("requests-root");
    if (root && !root.hasAttribute("data-mounted")) {
      const r = createRoot(root);
      r.render(<App />);
      root.setAttribute("data-mounted", "1");
    }
  } catch (e) {
    console.error("mountRequestsClient error", e);
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("load", mount);
  setTimeout(mount, 500);
}
