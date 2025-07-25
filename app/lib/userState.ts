import { User } from "@/app/models/user";
import { useState, useEffect } from "react";

let currentUser: any = null;

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem("currentUser");
  console.log("userState - getCurrentUser:", user);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User): void => {
  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(user));
  console.log("userState - setCurrentUser:", user);
  // Dispatch a custom event to notify user change
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("userChanged", { detail: user }));
  }
};

export const clearCurrentUser = (): void => {
  currentUser = null;
  localStorage.removeItem("currentUser");
};

export const isUserLoggedIn = (): boolean => {
  return !!getCurrentUser();
};

export function useProfiles() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    async function fetchProfiles() {
      const response = await fetch("/api/profiles");
      const data = await response.json();
      setProfiles(data);
    }
    fetchProfiles();
  }, []);

  return profiles;
}
