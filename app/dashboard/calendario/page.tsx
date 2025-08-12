"use client";
import { MyCalendar } from "../../componentes/MyCalendar";

export default function CalendarioPage() {
  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-6">Calendario</h1>
      <MyCalendar />
    </div>
  );
}
