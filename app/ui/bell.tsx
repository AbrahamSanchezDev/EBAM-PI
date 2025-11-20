"use client";
import React, { useState } from "react";
import { useNotifications } from "@/app/lib/notificationsClient";
import axios from "axios";

function truncate(s: string, n = 20) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "..." : s;
}

export default function Bell() {
  const { unreadCount, items, markAllRead, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const [modalItem, setModalItem] = useState<any | null>(null);

  const openModal = async (n: any) => {
    // mark as read in backend
    try {
      await axios.put("/api/notifications", { id: n.id });
    } catch (e) {
      console.error("mark read failed", e);
    }
    // refresh provider
    window.dispatchEvent(new CustomEvent("notifications:changed"));
    setModalItem(n);
  };

  const closeModal = () => setModalItem(null);

  return (
    <div className="relative inline-block">
      <button
        aria-label="Notificaciones"
        onClick={() => setOpen((s) => !s)}
        className="relative p-2 rounded hover:bg-gray-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <div className="text-sm font-semibold text-gray-800">Notificaciones</div>
              <div className="text-xs text-gray-500">Últimas notificaciones</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-sm text-blue-600" onClick={() => { markAllRead(); window.dispatchEvent(new CustomEvent('notifications:changed')); }}>
                Marcar todas como leídas
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">No hay notificaciones</div>
            )}
            <div className="divide-y">
              {items.map((n) => (
                <div key={n.id} className={`px-4 py-3 flex gap-3 items-start ${n.read ? "bg-white" : "bg-blue-50"}`}>
                  <div className="flex-shrink-0">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center ${n.read ? 'bg-gray-100' : 'bg-blue-600 text-white'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 6v.01" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <button className="w-full text-left" onClick={() => openModal(n)}>
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium text-gray-800">{truncate(n.message, 60)}</div>
                        <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleTimeString()}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{n.from}</div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 py-2 border-t text-right">
            <button className="text-sm text-blue-600" onClick={() => { setOpen(false); }}>Cerrar</button>
          </div>
        </div>
      )}

      {modalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center gap-4 p-4 border-b">
              <div className="bg-blue-600 text-white rounded-full p-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Notificación</h3>
                <p className="text-sm text-gray-500">{new Date(modalItem.createdAt).toLocaleString()}</p>
              </div>
              <div className="ml-auto">
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">Cerrar ✕</button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-sm text-gray-600 w-24">De</div>
                <div className="text-sm text-gray-800">{modalItem.from}</div>
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="text-sm text-gray-600 w-24">Para</div>
                <div className="text-sm text-gray-800">{modalItem.to}</div>
              </div>

              <div className="mt-2 p-4 bg-gray-50 rounded text-gray-800 whitespace-pre-wrap break-words">
                {modalItem.message}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t bg-white">
              <button onClick={closeModal} className="px-4 py-2 bg-white border rounded text-gray-700 hover:shadow">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
