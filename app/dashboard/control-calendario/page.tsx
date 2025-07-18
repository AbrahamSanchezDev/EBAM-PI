"use client";
import CrudCalendar from "@/app/componentes/CrudCalendar";
import { MyCalendar } from "../../componentes/MyCalendar";

export default function Page() {
  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Control de calendario</h1>
      <CrudCalendar />
    </main>
  );
}
