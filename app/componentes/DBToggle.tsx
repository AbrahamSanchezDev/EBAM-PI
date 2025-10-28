"use client";

import { useEffect, useState } from "react";

export default function DBToggle() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    try {
      const cookie = document.cookie || "";
      const initial = /use_atlas=1/.test(cookie);
      setOnline(initial);
    } catch (e) {
      setOnline(false);
    }
  }, []);

  function setCookieValue(value: boolean) {
    // cookie simple, path=/ para que esté disponible en todas las rutas
    const val = value ? "1" : "0";
    // Expires far future so persists between sessions; can be changed
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toUTCString();
    document.cookie = `use_atlas=${val}; path=/; SameSite=Lax; expires=${expires}`;
  }

  function onToggle() {
    const next = !online;
    setOnline(next);
    setCookieValue(next);
    // For debugging in dev
    if (typeof window !== "undefined") {
      console.log("DB toggle set to", next ? "ATLAS" : "LOCAL");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={online}
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-300 text-blue-600"
        />
        <span>Conectar a MongoDB Atlas (online)</span>
      </label>
    </div>
  );
}
