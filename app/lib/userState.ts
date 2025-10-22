import { useState, useEffect } from "react";
import axios from "axios";

// Devuelve solo el email guardado, o null si no hay usuario
export const getCurrentUser = (): string | null => {
  const email = localStorage.getItem("currentUser");
  console.log("userState - getCurrentUser (email):", email);
  return email || null;
};

// Guarda el email y opcionalmente features del usuario
export const setCurrentUser = (email: string, features?: string[] | null): void => {
  localStorage.setItem("currentUser", email);
  if (features) {
    localStorage.setItem("currentUserFeatures", JSON.stringify(features));
  } else {
    localStorage.removeItem("currentUserFeatures");
  }
  console.log("userState - setCurrentUser (email):", email, "features:", features);
  // Dispatch a custom event to notify user change (email + features)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("userChanged", { detail: { email, features } }));
  }
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentUserFeatures");
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

export function useCurrentUserProfile() {
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    const fetchProfile = async () => {
      const email = getCurrentUser();
      if (!email) return setProfile(null);
      try {
        const res = await axios.get("/api/profiles/me", {
          headers: { "x-user-email": email },
        });
        setProfile(res.data);
        // If response includes features, persist them locally
        if (res.data?.features) {
          try {
            localStorage.setItem("currentUserFeatures", JSON.stringify(res.data.features));
          } catch (e) {
            console.warn("Could not persist features", e);
          }
        }
      } catch (err) {
        console.error("fetchProfile error", err);
        setProfile(null);
      }
    };
    fetchProfile();

    const handler = () => fetchProfile();
    window.addEventListener("userChanged", handler);
    return () => window.removeEventListener("userChanged", handler);
  }, []);
  return profile;
}

export function getCurrentUserFeatures(): string[] | null {
  try {
    const raw = localStorage.getItem("currentUserFeatures");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
