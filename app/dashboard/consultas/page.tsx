"use client";
import { Metadata } from "next";
import { lusitana } from "@/app/ui/fonts";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCurrentUserProfile } from "@/app/lib/userState";


export default function Page() {
  const profile = useCurrentUserProfile();
  const [minutes, setMinutes] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setMinutes((profile as any).calendarNotificationMinutes ?? null);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile || !profile._id) return alert("Perfil no cargado");
    setSaving(true);
    try {
      const body = { ...profile, calendarNotificationMinutes: minutes === null ? null : Number(minutes) };
      await axios.put(`/api/profiles/${profile._id}`, body);
      alert("Preferencia guardada");
    } catch (e) {
      console.error(e);
      alert("Error guardando preferencia");
    }
    setSaving(false);
  };

  

  return (
    <main>
      <div className="p-6 bg-white rounded shadow max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Notificaciones de calendario</h2>
        <p className="text-sm text-gray-600 mb-2">Configura cuántos minutos antes de un evento quieres recibir la notificación de escritorio. Deja vacío para desactivar.</p>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min={0}
            placeholder="Ej: 10"
            className="p-2 border rounded w-32"
            value={minutes ?? ""}
            onChange={(e) => setMinutes(e.target.value === "" ? null : Number(e.target.value))}
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar preferencia"}
          </button>
        </div>
      </div>
     

    </main>
  );
}
