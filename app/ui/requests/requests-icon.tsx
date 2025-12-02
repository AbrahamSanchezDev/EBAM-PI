"use client";
import React, { useState } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useRequests } from "@/app/lib/requestsClient";
import { getCurrentUser } from "@/app/lib/userState";

export default function RequestsIcon() {
  const { items, unreadCount, refresh, approve, reject } = useRequests();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseMap, setResponseMap] = useState<Record<string, string>>({});

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
        <div className="fixed inset-0 z-50 flex items-center justify-center md:absolute md:right-0 md:mt-2 md:w-[560px] md:items-start md:justify-end bg-black bg-opacity-40 md:bg-transparent">
          <div className="w-full max-w-lg md:w-[560px] bg-white border rounded-lg shadow-xl p-3">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div>
              <div className="text-sm font-semibold text-gray-800">Solicitudes de eventos</div>
              <div className="text-xs text-gray-500">Revisa y responde las solicitudes</div>
            </div>
            <div className="text-sm text-gray-600">Pendientes: <span className="font-medium text-gray-800">{pending.length}</span></div>
          </div>

          <div className="max-h-96 overflow-y-auto mt-3 space-y-3">
            {pending.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">No hay solicitudes pendientes.</div>
            )}
            <div className="divide-y">
              {pending.map((r: any) => {
                const expanded = expandedId === String(r._id);
                return (
                  <div key={r._id} className="px-3 py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <EnvelopeIcon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{r.title}</div>
                            <div className="text-xs text-gray-500">{r.requesterEmail} · {new Date(r.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">{new Date(r.start).toLocaleString()}</div>
                            <button className="text-xs text-indigo-600 mt-2" onClick={() => setExpandedId(expanded ? null : String(r._id))}>{expanded ? 'Cerrar' : 'Ver'}</button>
                          </div>
                        </div>
                        {expanded && (
                          <div className="mt-3 bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-700 mb-2"><strong>Calendario:</strong> {r.calendarName}</div>
                            <div className="text-sm text-gray-700 mb-2"><strong>Fecha:</strong> {new Date(r.start).toLocaleString()} - {new Date(r.end).toLocaleString()}</div>
                            <div className="text-sm text-gray-700 mb-3"><strong>Descripción:</strong> <div className="mt-1 text-gray-800 whitespace-pre-wrap">{r.description || '(sin descripción)'}</div></div>
                            <label className="block text-sm text-gray-600 mb-1">Respuesta (opcional)</label>
                            <textarea className="w-full border p-2 rounded mb-3" value={responseMap[String(r._id)] || ''} onChange={(e) => setResponseMap((m) => ({ ...m, [String(r._id)]: e.target.value }))} />
                            <div className="flex gap-2 justify-end">
                              <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async () => { const admin = getCurrentUser() || 'admin'; await approve(r._id, admin, responseMap[String(r._id)] || ''); setResponseMap((m) => ({ ...m, [String(r._id)]: '' })); refresh(); }}>Aprobar</button>
                              <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={async () => { const admin = getCurrentUser() || 'admin'; await reject(r._id, admin, responseMap[String(r._id)] || ''); setResponseMap((m) => ({ ...m, [String(r._id)]: '' })); refresh(); }}>Rechazar</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
