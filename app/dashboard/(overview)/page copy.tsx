
"use client";
import React, { useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import es from 'date-fns/locale/es';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date, options: any) => startOfWeek(date, { ...options, locale: es }),
  getDay,
  locales,
});

const myEventsList = [
  {
    title: 'Evento de ejemplo',
    start: new Date(2025, 6, 2, 10, 0),
    end: new Date(2025, 6, 2, 12, 0),
  },
  {
    title: 'Reunión importante',
    start: new Date(2025, 6, 3, 14, 0),
    end: new Date(2025, 6, 3, 15, 30),
  },
];


export default function Page() {
 
  const memoLocalizer = useMemo(() => localizer, []);
  return (
    <div style={{ padding: 24 }}>
      <h1>Calendario de prueba</h1>
      {BigCalendar && (
        // @ts-ignore
        // Usar createElement para evitar error de tipos con JSX
        // eslint-disable-next-line react/react-in-jsx-scope
        React.createElement(BigCalendar, {
          localizer: memoLocalizer,
          events: myEventsList,
          startAccessor: "start",
          endAccessor: "end",
          style: { height: 500 },
          culture: "es",
          defaultView: "week",
          views: ["month", "week", "work_week", "day", "agenda"],
          toolbar: true,
          popup: true,
        })
      )}
    </div>
  );
}