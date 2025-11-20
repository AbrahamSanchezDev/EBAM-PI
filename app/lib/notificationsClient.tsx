"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { getCurrentUser } from "./userState";

type Notification = {
  id: string;
  to: string;
  from?: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

type ContextValue = {
  unreadCount: number;
  items: Notification[];
  refresh: () => Promise<void>;
  sendNotification: (to: string, message: string, from?: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<ContextValue | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within Provider");
  return ctx;
};

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // keep seen IDs in a ref so fetch closures always see the latest
  const seenRef = React.useRef<Record<string, boolean>>({});

  // load seen ids from sessionStorage so notifications aren't shown again on reload
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = sessionStorage.getItem("seenNotificationIds");
        if (raw) seenRef.current = JSON.parse(raw);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const fetch = async () => {
    const email = getCurrentUser();
    if (!email) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await axios.get(`/api/notifications?email=${encodeURIComponent(email)}`);
      const rawItems = res.data.items || [];
      const normalized = rawItems.map((x: any) => ({
        id: x.id || x._id || (x._id?._id?.toString ? x._id.toString() : undefined),
        to: x.to,
        from: x.from,
        message: x.message,
        createdAt: x.createdAt ? new Date(x.createdAt).toISOString() : new Date().toISOString(),
        read: !!x.read,
      }));
      // show desktop notifications for newly received items (not shown before)
      try {
        const newOnes = normalized.filter((it: any) => !!it.id && !seenRef.current[it.id]);
        if (newOnes.length > 0) {
          // request permission if not granted
          if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
            await Notification.requestPermission().catch(() => {});
          }
          newOnes.forEach((it: any) => {
            try {
              if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                // show a simple desktop notification
                new Notification(it.from ? `${it.from}` : "Notificación", {
                  body: it.message,
                });
              }
            } catch (e) {
              // ignore
            }
            // mark as seen so we don't show again
            if (it.id) seenRef.current[it.id] = true;
          });
          // persist seen ids for this session
          try {
            sessionStorage.setItem("seenNotificationIds", JSON.stringify(seenRef.current));
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        console.error("desktop notification error", e);
      }

      setItems(normalized);
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("fetch notifications", err);
    }
  };

  useEffect(() => {
    // initial fetch on mount
    fetch();

    // listen to userChanged events to refetch
    const onUserChanged = () => fetch();
    window.addEventListener("userChanged", onUserChanged);
  const onNotifsChanged = () => fetch();
  window.addEventListener("notifications:changed", onNotifsChanged);

  // Subscribe to server-sent events to receive broadcasts (profile updates, etc.)
  let es: EventSource | null = null;
  try {
    if (typeof window !== "undefined") {
      es = new EventSource('/api/broadcast/stream');
      es.addEventListener('profile-updated', (e: any) => {
        try {
          const payload = JSON.parse(e.data || '{}');
          const current = getCurrentUser();
          console.log('SSE profile-updated received', payload, 'current:', current);
          if (payload?.email && current && payload.email === current) {
            // update local storage features if present
            if (payload.updated?.features) {
                try {
                  if (typeof window !== "undefined") {
                    localStorage.setItem('currentUserFeatures', JSON.stringify(payload.updated.features));
                  }
                } catch (err) {
                  console.warn('Could not persist updated features to localStorage', err);
                }
            }
            // dispatch userChanged with updated profile detail so hooks react immediately
            window.dispatchEvent(new CustomEvent('userChanged', { detail: payload.updated }));
            // also refresh notifications
            fetch();
          }
        } catch (err) {
          console.error('Invalid SSE payload', err);
        }
      });
      es.addEventListener('notification-created', (e: any) => {
        try {
          const payload = JSON.parse(e.data || '{}');
          const current = getCurrentUser();
          console.log('SSE notification-created received', payload, 'current:', current);
          if (payload?.to && current && payload.to === current) {
            // If notification includes updatedFeatures, apply them immediately
            if (payload.data?.updatedFeatures) {
              try {
                if (typeof window !== "undefined") {
                  localStorage.setItem('currentUserFeatures', JSON.stringify(payload.data.updatedFeatures));
                }
              } catch (err) {
                console.warn('Could not persist updated features to localStorage', err);
              }
              // dispatch userChanged so UI updates
              window.dispatchEvent(new CustomEvent('userChanged', { detail: { features: payload.data.updatedFeatures } }));
            }
            // trigger a refetch of notifications
            fetch();
          }
        } catch (err) {
          console.error('Invalid SSE payload (notification-created)', err);
        }
      });

      es.onopen = () => {
        // connected
      };
      es.onerror = (err) => {
        console.warn('SSE connection error', err);
        // Try reconnect logic will be handled by browser automatically for EventSource
      };
    }
  } catch (e) {
    console.warn('SSE subscription failed', e);
  }

    // poll periodically (every 30s)
    const t = setInterval(fetch, 30000);
    return () => {
      clearInterval(t);
      window.removeEventListener("userChanged", onUserChanged);
      window.removeEventListener("notifications:changed", onNotifsChanged);
      try {
        if (es) es.close();
      } catch (e) {}
    };
  }, []);

  const sendNotification = async (to: string, message: string, from?: string) => {
    // Try sending as-is first. If recipient not found (404), retry with normalized email
    const normalized = (to || "").toString().trim().toLowerCase();
    try {
      await axios.post("/api/notifications", { to, message, from });
    } catch (err: any) {
      // If server returned 404 (recipient not found), try normalized email once
      if (err?.response?.status === 404) {
        // consult lookup endpoint to try to find the canonical stored email
        try {
          const lookupRes = await axios.get(`/api/profiles/lookup?email=${encodeURIComponent(to)}`);
          const data = lookupRes.data || {};
          if (data?.found && data.email) {
            try {
              await axios.post("/api/notifications", { to: data.email, message, from });
              to = data.email;
            } catch (err3) {
              throw err3;
            }
          } else if (normalized && normalized !== to) {
            // fallback: try the basic normalized version
            try {
              await axios.post("/api/notifications", { to: normalized, message, from });
              to = normalized;
            } catch (err2) {
              throw err2;
            }
          } else {
            throw err;
          }
        } catch (lookupErr) {
          // if lookup failed or didn't help, rethrow original
          throw err;
        }
      } else {
        throw err;
      }
    }

    // if the current user is the recipient, refresh
    const me = getCurrentUser();
    if (me === to) await fetch();
    // emit an event so other clients can react
    window.dispatchEvent(new CustomEvent("notifications:changed"));
  };

  const markAllRead = async () => {
    const email = getCurrentUser();
    if (!email) return;
    await axios.put("/api/notifications", { markAllFor: email });
    await fetch();
  };

  const value: ContextValue = {
    unreadCount,
    items,
    refresh: fetch,
    sendNotification,
    markAllRead,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};
