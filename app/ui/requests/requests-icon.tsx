"use client";
import React, { useState } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useRequests } from "@/app/lib/requestsClient";
import { getCurrentUser } from "@/app/lib/userState";

export default function RequestsIcon() {
  const { items, unreadCount, refresh, approve, reject } = useRequests();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [responseText, setResponseText] = useState("");

  const pending = items.filter((i: any) => i.status === "pending");

  return (
    <div className="relative">
      <button
        className="p-2"
        onClick={() => {
          setOpen(!open);
          refresh();
        }}
        title="Solicitudes"
      >
        <EnvelopeIcon className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[520px] bg-white border shadow-lg rounded-md p-4 z-50">
          <h4 className="font-bold mb-2">Solicitudes de eventos</h4>
          {pending.length === 0 ? (
            <div className="text-gray-500">No hay solicitudes pendientes.</div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {pending.map((r: any) => (
                <div key={r._id} className="border p-2 rounded">
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-sm text-gray-600">
                    Calendario: {r.calendarName}
                  </div>
                  <div className="text-sm text-gray-600">De: {r.requesterEmail}</div>
                  <div className="text-sm text-gray-600">
                    Fecha: {new Date(r.start).toLocaleString()} -{" "}
                    {new Date(r.end).toLocaleString()}
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm mb-1">Mensaje (opcional)</label>
                    <textarea
                      className="w-full border p-2 rounded mb-2"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Mensaje para el solicitante"
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded"
                        onClick={async () => {
                          const admin = getCurrentUser() || "admin";
                          await approve(r._id, admin, responseText);
                          setResponseText("");
                          refresh();
                        }}
                      >
                        Aprobar
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded"
                        onClick={async () => {
                          const admin = getCurrentUser() || "admin";
                          await reject(r._id, admin, responseText);
                          setResponseText("");
                          refresh();
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
