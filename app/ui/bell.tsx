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
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-2 border-b flex justify-between items-center">
            <strong>Notificaciones</strong>
            <button className="text-sm text-blue-600" onClick={() => { markAllRead(); window.dispatchEvent(new CustomEvent('notifications:changed')); }}>
              Marcar todas leídas
            </button>
          </div>
          <div className="max-h-64 overflow-auto">
            {items.length === 0 && <div className="p-3 text-sm text-gray-500">No hay notificaciones</div>}
            {items.map((n) => (
              <div key={n.id} className={`p-3 border-b ${n.read ? "bg-white" : "bg-blue-50"}`}>
                <button className="w-full text-left" onClick={() => openModal(n)}>
                  <div className="text-sm text-gray-800">{truncate(n.message, 20)}</div>
                  <div className="text-xs text-gray-500">{n.from} · {new Date(n.createdAt).toLocaleString()}</div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-lg max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-bold mb-2">Notificación</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-700"><strong>De:</strong> {modalItem.from}</div>
              <div className="text-sm text-gray-700"><strong>Para:</strong> {modalItem.to}</div>
              <div className="text-sm text-gray-700"><strong>Fecha:</strong> {new Date(modalItem.createdAt).toLocaleString()}</div>
            </div>
            <div className="mb-4 text-gray-800 whitespace-pre-wrap break-words">{modalItem.message}</div>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={closeModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
