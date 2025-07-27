export interface Profile {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  matricula: string;
  carrera: string;
  grupo: string;
  rfids: { id: string; active: boolean }[];
  calendarIds: string[];
}

export const createProfile = (
  name: string,
  email: string,
  password: string,
  role: "admin" | "user",
  matricula: string,
  carrera: string,
  grupo: string,
  rfids: { id: string; active: boolean }[],
  calendarIds: string[]
): Profile => {
  return {
    name,
    email,
    password,
    role,
    matricula,
    carrera,
    grupo,
    rfids,
    calendarIds,
  };
};
