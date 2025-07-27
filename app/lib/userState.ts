import { useState, useEffect } from "react";

// Devuelve solo el email guardado, o null si no hay usuario
export const getCurrentUser = (): string | null => {
  const email = localStorage.getItem("currentUser");
  console.log("userState - getCurrentUser (email):", email);
  return email || null;
};

// Guarda solo el email del usuario
export const setCurrentUser = (email: string): void => {
  localStorage.setItem("currentUser", email);
  console.log("userState - setCurrentUser (email):", email);
  // Dispatch a custom event to notify user change (solo email)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("userChanged", { detail: email }));
  }
};

export const clearCurrentUser = (): void => {
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
