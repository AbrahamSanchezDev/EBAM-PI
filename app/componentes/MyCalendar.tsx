import { useMemo } from "react";
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/userState";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import es from "date-fns/locale/es";
import { format, parse, startOfWeek, getDay, Locale } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { myEventsList } from "./myEventsList";

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (
    date: number | Date,
    options:
      | { locale?: Locale; weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }
      | undefined
  ) => startOfWeek(date, { ...options, locale: es }),
  getDay,
  locales,
});

const myEventsList0 = [
  {
    title: "Evento de ejemplo",
    start: new Date(2025, 7, 8, 10, 0),
    end: new Date(2025, 7, 8, 12, 0),
  },
  {
    title: "Reunión importante",
    start: new Date(2025, 7, 8, 14, 0),
    end: new Date(2025, 7, 8, 15, 30),
  },
];

const messages = {
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  allDay: "Todo el día",
  week: "Semana",
  work_week: "Semana laboral",
  day: "Día",
  month: "Mes",
  previous: "Anterior",
  next: "Siguiente",
  yesterday: "Ayer",
  tomorrow: "Mañana",
  today: "Hoy",
  agenda: "Agenda",
  noEventsInRange: "No hay eventos en este rango.",
  showMore: (total: number) => `+ Ver más (${total})`,
};

export function MyCalendar() {
  const memoLocalizer = useMemo(() => localizer, []);
  const [calendarIds, setCalendarIds] = useState<string[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>("");
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<any>("week");
  const [date, setDate] = useState<Date>(new Date());

  // Fetch user calendar names (IDs)
  useEffect(() => {
    const fetchCalendars = async () => {
      const email = getCurrentUser();
      if (!email) return;
      setLoading(true);
      try {
        // Aquí no debe ir useState, solo fetch y set
        const apiUrl = `/api/calendars/userCalendars?email=${email}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (data.calendarios) {
          setCalendarIds(data.calendarios.map((c: any) => c.name));
          if (data.calendarios.length > 0) {
            setSelectedCalendar(data.calendarios[0].name);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCalendars();
  }, []);

  // Fetch events for selected calendar
  useEffect(() => {
    console.log("DATA Actual:");
    console.table(calendarEvents);
    const fetchEvents = async () => {
      if (!selectedCalendar) return;
      setLoading(true);
      try {
        const urlCalendario = `/api/calendars?name=${encodeURIComponent(
          selectedCalendar
        )}`;
        console.log("Fetching events from API:", urlCalendario);
        const res = await fetch(urlCalendario);
        const data = await res.json();
        console.log("Fetched calendar data:", data);
        if (data && Array.isArray(data.events)) {
          console.log("Original events from DB:", data.events);
          const dataNueva = data.events.map((ev: any) => {
            const mapped = {
              title: ev.title ?? "(Sin título)",
              start: typeof ev.start === "string" ? new Date(ev.start) : ev.start,
              end: typeof ev.end === "string" ? new Date(ev.end) : ev.end,
            };
            console.log("Mapped event:", mapped);
            return mapped;
          });
          setCalendarEvents(dataNueva);
          console.log("DATA NUEVA:");
          console.table(dataNueva);
        } else {
          console.log("NO HAY DATA");
          setCalendarEvents([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedCalendar]);

  return (
    <div style={{ padding: 24 }}>
      <div className="mb-4 flex gap-2">
        {calendarIds.length === 0 && (
          <span className="text-gray-500">No tienes calendarios guardados.</span>
        )}
        {calendarIds.map((id) => (
          <button
            key={id}
            className={`px-4 py-2 rounded-lg font-semibold shadow transition-all border-2 ${
              selectedCalendar === id
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white text-blue-700 border-blue-300 hover:bg-blue-100"
            }`}
            onClick={() => setSelectedCalendar(id)}
          >
            {id}
          </button>
        ))}
      </div>
      {selectedCalendar && (
        <>
          <h2 className="mb-2 text-lg font-bold text-blue-700">
            {selectedCalendar} ACTIVO
          </h2>

          <Calendar
            localizer={memoLocalizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            culture="es"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            defaultView="week"
            views={["month", "week", "work_week", "day", "agenda"]}
            toolbar={true}
            popup={true}
            messages={messages}
          />
        </>
      )}
    </div>
  );
}
