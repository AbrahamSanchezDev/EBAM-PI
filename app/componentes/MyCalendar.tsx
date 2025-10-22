import { useMemo } from "react";
import React, { useEffect, useState } from "react";
import { getCurrentUser, useCurrentUserProfile } from "@/app/lib/userState";
import { useNotifications } from "@/app/lib/notificationsClient";
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
  const profile = useCurrentUserProfile();
  const notificationsCtx = (() => {
    try {
      return useNotifications();
    } catch (e) {
      return null as any;
    }
  })();

  // seen event notifications for this session to avoid duplicates
  const seenEventNotifsRef = React.useRef<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("seenEventNotifs");
      if (raw) seenEventNotifsRef.current = JSON.parse(raw);
    } catch (e) {
      // ignore
    }
  }, []);

  // Poll calendar events for upcoming notifications
  useEffect(() => {
    let t: any = null;
    const checkUpcoming = async () => {
      try {
        const minutesBefore = profile?.calendarNotificationMinutes;
        if (!minutesBefore || Number.isNaN(Number(minutesBefore))) return;
        const now = Date.now();
        for (const ev of calendarEvents) {
          const start =
            ev.start instanceof Date
              ? ev.start.getTime()
              : new Date(ev.start).getTime();
          const diffMin = (start - now) / 60000;
          // only notify when within threshold and in the future
          if (diffMin <= Number(minutesBefore) && diffMin >= 0) {
            // create a stable id for the event
            const id = `${selectedCalendar || "cal"}-${start}-${(
              ev.title || ""
            ).replace(/\s+/g, "_")}`;
            if (seenEventNotifsRef.current[id]) continue;

            // mark seen immediately to avoid duplicates
            seenEventNotifsRef.current[id] = true;
            try {
              sessionStorage.setItem(
                "seenEventNotifs",
                JSON.stringify(seenEventNotifsRef.current)
              );
            } catch (e) {}

            // request permission and show desktop notification
            try {
              if (
                typeof Notification !== "undefined" &&
                Notification.permission !== "granted"
              ) {
                await Notification.requestPermission().catch(() => {});
              }
              if (
                typeof Notification !== "undefined" &&
                Notification.permission === "granted"
              ) {
                new Notification(ev.title || "Evento próximo", {
                  body: `Comienza en ${Math.round(diffMin)} minutos`,
                });
              }
            } catch (e) {
              console.error("Error mostrando notificación de evento", e);
            }

            // also create a server-side notification record so it appears in the bell
            try {
              const email = getCurrentUser();
              if (email) {
                const message = `Evento: ${
                  ev.title || "(sin título)"
                } — comienza en ${Math.round(diffMin)} minutos`;
                if (notificationsCtx && notificationsCtx.sendNotification) {
                  await notificationsCtx.sendNotification(
                    email,
                    message,
                    "Calendario"
                  );
                } else {
                  await fetch("/api/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ to: email, message, from: "Calendario" }),
                  });
                  // notify other UI to refresh
                  window.dispatchEvent(new CustomEvent("notifications:changed"));
                }
              }
            } catch (e) {
              console.error("Error creando notificación en servidor", e);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    // check immediately and then every 30s
    checkUpcoming();
    t = setInterval(checkUpcoming, 30000);
    return () => clearInterval(t);
  }, [calendarEvents, profile, selectedCalendar]);

  // Ensure calendar shows today when a calendar is selected (or on mount)
  useEffect(() => {
    setDate(new Date());
  }, [selectedCalendar]);

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

  // Request modal state (single date + separate start/end times)
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState("");
  const [reqDate, setReqDate] = useState<string>("");
  const [reqStartTime, setReqStartTime] = useState<string>("");
  const [reqEndTime, setReqEndTime] = useState<string>("");
  const [reqDesc, setReqDesc] = useState<string>("");

  const openRequestModal = () => {
    if (!selectedCalendar) return alert("Selecciona un calendario primero");
    setReqTitle("");
    setReqDate("");
    setReqStartTime("");
    setReqEndTime("");
    setReqDesc("");
    setRequestModalOpen(true);
  };

  const submitRequest = async () => {
    if (!reqTitle || !reqDate || !reqStartTime || !reqEndTime)
      return alert("Por favor completa los campos obligatorios");

    try {
      // Combine date + times into ISO strings (local time -> toISOString for server)
      const start = new Date(`${reqDate}T${reqStartTime}`);
      const end = new Date(`${reqDate}T${reqEndTime}`);
      if (isNaN(start.getTime()) || isNaN(end.getTime()))
        return alert("Fecha u hora inválida");
      if (start.getTime() >= end.getTime())
        return alert("La hora de inicio debe ser anterior a la hora de fin");

      const startIso = start.toISOString();
      const endIso = end.toISOString();

      const res = await fetch("/api/calendar-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": getCurrentUser() || "",
        },
        body: JSON.stringify({
          calendarName: selectedCalendar,
          title: reqTitle,
          start: startIso,
          end: endIso,
          description: reqDesc,
          requesterEmail: getCurrentUser(),
        }),
      });
      if (res.ok) {
        alert("Solicitud enviada. Los administradores la revisarán.");
        setRequestModalOpen(false);
      } else {
        alert("Error enviando la solicitud");
      }
    } catch (e) {
      console.error(e);
      alert("Error enviando la solicitud");
    }
  };

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
          <div className="mb-4">
            {profile?.role !== "admin" && (
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded mr-2"
                onClick={openRequestModal}
              >
                Solicitar evento
              </button>
            )}
          </div>

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
            onNavigate={(d) => setDate(d)}
            defaultDate={new Date()}
            defaultView="week"
            views={["month", "week", "work_week", "day", "agenda"]}
            toolbar={true}
            popup={true}
            messages={messages}
          />
        </>
      )}
      {requestModalOpen && profile?.role !== "admin" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-[520px]">
            <h3 className="text-lg font-bold mb-3">
              Solicitar evento para {selectedCalendar}
            </h3>
            <label className="block mb-2">Título *</label>
            <input
              className="w-full border p-2 rounded mb-3"
              value={reqTitle}
              onChange={(e) => setReqTitle(e.target.value)}
            />
            <label className="block mb-2">Fecha *</label>
            <input
              type="date"
              className="w-full border p-2 rounded mb-3"
              value={reqDate}
              onChange={(e) => setReqDate(e.target.value)}
            />
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block mb-2">Inicio (hora) *</label>
                <input
                  type="time"
                  className="w-full border p-2 rounded mb-3"
                  value={reqStartTime}
                  onChange={(e) => setReqStartTime(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <label className="block mb-2">Fin (hora) *</label>
                <input
                  type="time"
                  className="w-full border p-2 rounded mb-3"
                  value={reqEndTime}
                  onChange={(e) => setReqEndTime(e.target.value)}
                />
              </div>
            </div>
            <label className="block mb-2">Descripción</label>
            <textarea
              className="w-full border p-2 rounded mb-3"
              value={reqDesc}
              onChange={(e) => setReqDesc(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setRequestModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={submitRequest}
              >
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
