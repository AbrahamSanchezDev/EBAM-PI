export interface User {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

export const createUser = (
  name: string,
  email: string,
  password: string,
  role: "admin" | "user"
): User => {
  return { name, email, password, role };
};
