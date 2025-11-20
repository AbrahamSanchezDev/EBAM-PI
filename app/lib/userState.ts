import { useState, useEffect } from "react";
import axios from "axios";

// Devuelve solo el email guardado, o null si no hay usuario
export const getCurrentUser = (): string | null => {
  // localStorage is only available in the browser — make this safe for server execution
  if (typeof window === "undefined") return null;
  try {
    const email = localStorage.getItem("currentUser");
    // keep lightweight logging but avoid throwing
    // console.log("userState - getCurrentUser (email):", email);
    return email || null;
  } catch (e) {
    return null;
  }
};

// Guarda el email y opcionalmente features del usuario
export const setCurrentUser = (email: string, features?: string[] | null): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("currentUser", email);
    if (features) {
      localStorage.setItem("currentUserFeatures", JSON.stringify(features));
    } else {
      localStorage.removeItem("currentUserFeatures");
    }
  } catch (e) {
    // ignore storage errors
  }
  // Dispatch a custom event to notify user change (email + features)
  try {
    window.dispatchEvent(new CustomEvent("userChanged", { detail: { email, features } }));
  } catch (e) {
    // ignore
  }
};

export const clearCurrentUser = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserFeatures");
  } catch (e) {
    // ignore
  }
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

    const handler = (ev?: any) => {
      // If the event provides detail with the updated profile, use it for immediate update
      try {
        const data = ev?.detail;
        if (data && typeof data === "object") {
          setProfile(data);
          if (data?.features) {
            try {
              localStorage.setItem("currentUserFeatures", JSON.stringify(data.features));
            } catch (e) {
              console.warn("Could not persist features", e);
            }
          }
          return;
        }
      } catch (e) {
        // fall back to fetch
      }
      fetchProfile();
    };
    window.addEventListener("userChanged", handler);
    return () => window.removeEventListener("userChanged", handler);
  }, []);
  return profile;
}

export function getCurrentUserFeatures(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("currentUserFeatures");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
