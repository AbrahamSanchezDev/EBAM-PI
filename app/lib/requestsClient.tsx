"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { getCurrentUser } from "./userState";

type RequestItem = any;

type ContextValue = {
  items: RequestItem[];
  unreadCount: number;
  refresh: () => Promise<void>;
  approve: (id: string, adminEmail: string, message?: string) => Promise<void>;
  reject: (id: string, adminEmail: string, message?: string) => Promise<void>;
};

const RequestsContext = createContext<ContextValue | undefined>(undefined);
export const useRequests = () => {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error("useRequests must be used within Provider");
  return ctx;
};

export const RequestsProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = async () => {
    const me = getCurrentUser();
    if (!me) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    try {
      // try admin listing
      const res = await axios.get(`/api/calendar-requests?admin=1`, {
        headers: { "x-user-email": me },
      });
      const data = res.data.items || [];
      setItems(data);
      setUnreadCount(data.filter((d: any) => d.status === "pending").length);
    } catch (e) {
      // fallback: user's own requests
      try {
        const res2 = await axios.get(
          `/api/calendar-requests?email=${encodeURIComponent(me)}`,
          { headers: { "x-user-email": me } }
        );
        const data2 = res2.data.items || [];
        setItems(data2);
        setUnreadCount(0);
      } catch (e) {
        setItems([]);
        setUnreadCount(0);
      }
    }
  };

  useEffect(() => {
    fetch();
    const t = setInterval(fetch, 30000);
    return () => clearInterval(t);
  }, []);

  const approve = async (id: string, adminEmail: string, message?: string) => {
    await axios.put(
      `/api/calendar-requests`,
      { id, action: "approve", adminEmail, responseMessage: message },
      { headers: { "x-user-email": adminEmail } }
    );
    await fetch();
  };
  const reject = async (id: string, adminEmail: string, message?: string) => {
    await axios.put(
      `/api/calendar-requests`,
      { id, action: "reject", adminEmail, responseMessage: message },
      { headers: { "x-user-email": adminEmail } }
    );
    await fetch();
  };

  return (
    <RequestsContext.Provider
      value={{ items, unreadCount, refresh: fetch, approve, reject }}
    >
      {children}
    </RequestsContext.Provider>
  );
};
