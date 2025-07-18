import { useMemo } from "react";
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
    start: new Date(2025, 6, 2, 10, 0),
    end: new Date(2025, 6, 2, 12, 0),
  },
  {
    title: "Reunión importante",
    start: new Date(2025, 6, 3, 14, 0),
    end: new Date(2025, 6, 3, 15, 30),
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
  return (
    <div style={{ padding: 24 }}>
      <h1>Calendario de 9A</h1>
      <Calendar
        localizer={memoLocalizer}
        events={myEventsList0}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        culture="es"
        defaultView="week"
        views={["month", "week", "work_week", "day", "agenda"]}
        toolbar={true}
        popup={true}
        messages={messages}
      />
    </div>
  );
}
