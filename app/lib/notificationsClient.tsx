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

    // poll periodically (every 30s)
    const t = setInterval(fetch, 30000);
    return () => {
      clearInterval(t);
      window.removeEventListener("userChanged", onUserChanged);
      window.removeEventListener("notifications:changed", onNotifsChanged);
    };
  }, []);

  const sendNotification = async (to: string, message: string, from?: string) => {
    await axios.post("/api/notifications", { to, message, from });
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
