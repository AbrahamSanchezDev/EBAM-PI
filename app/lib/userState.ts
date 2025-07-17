import { User } from "@/app/models/user";

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
