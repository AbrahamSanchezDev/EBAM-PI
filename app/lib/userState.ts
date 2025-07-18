import { User } from "@/app/models/user";
import { useState, useEffect } from "react";

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem("currentUser", JSON.stringify(user));
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
