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
  const [reqLocation, setReqLocation] = useState<string>("");
  const [isCreateMode, setIsCreateMode] = useState(false);

  const openRequestModal = () => {
    if (!selectedCalendar) return alert("Selecciona un calendario primero");
    setReqTitle("");
    setReqDate("");
    setReqStartTime("");
    setReqEndTime("");
    setReqDesc("");
    setReqLocation("");
    setIsCreateMode(false);
    setRequestModalOpen(true);
  };

  const openCreateModalFromSlot = (slotInfo: any) => {
    if (!selectedCalendar) return alert("Selecciona un calendario primero");
    // slotInfo.start and slotInfo.end are Dates
    const start = slotInfo.start ? new Date(slotInfo.start) : new Date();
    const end = slotInfo.end ? new Date(slotInfo.end) : new Date(start.getTime() + 60 * 60 * 1000);

    const toDateInput = (d: Date) => d.toISOString().slice(0, 10);
    const toTimeInput = (d: Date) => d.toTimeString().slice(0,5);

    setReqTitle("");
    setReqDate(toDateInput(start));
    setReqStartTime(toTimeInput(start));
    setReqEndTime(toTimeInput(end));
    setReqDesc("");
    setReqLocation("");
    setIsCreateMode(true);
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
            selectable
            onSelectSlot={(slotInfo) => {
              try {
                // slotInfo can be a single slot or a range with start/end
                openCreateModalFromSlot(slotInfo);
              } catch (e) {
                console.error('onSelectSlot error', e);
              }
            }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-start gap-4">
              <div className="rounded-full bg-white/20 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{isCreateMode ? 'Crear evento' : 'Solicitar evento'} — {selectedCalendar}</h3>
                <p className="text-sm opacity-90 mt-1">Selecciona un título, horario y una ubicación aproximada. Día: <span className="font-medium">{reqDate || '—'}</span></p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input className="w-full border border-gray-200 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-300" value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Día *</label>
                  <input type="date" className="w-full border border-gray-200 rounded px-3 py-2 shadow-sm" value={reqDate} onChange={(e) => setReqDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Inicio *</label>
                  <input type="time" className="w-full border border-gray-200 rounded px-3 py-2 shadow-sm" value={reqStartTime} onChange={(e) => setReqStartTime(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fin *</label>
                  <input type="time" className="w-full border border-gray-200 rounded px-3 py-2 shadow-sm" value={reqEndTime} onChange={(e) => setReqEndTime(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ubicación aproximada</label>
                <input className="w-full border border-gray-200 rounded px-3 py-2 shadow-sm" placeholder="Ej. Auditorio, Sala 3, Oficina A" value={reqLocation} onChange={(e) => setReqLocation(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
                <textarea className="w-full border border-gray-200 rounded px-3 py-2 shadow-sm" rows={3} value={reqDesc} onChange={(e) => setReqDesc(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-white">
              <button className="px-4 py-2 bg-white border rounded text-gray-600 hover:bg-gray-50" onClick={() => setRequestModalOpen(false)}>Cancelar</button>
              {isCreateMode ? (
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded shadow" onClick={async () => {
                  // create event directly in calendar
                  try {
                    // validate
                    if (!reqTitle || !reqDate || !reqStartTime || !reqEndTime) return alert('Por favor completa los campos obligatorios');
                    const start = new Date(`${reqDate}T${reqStartTime}`);
                    const end = new Date(`${reqDate}T${reqEndTime}`);
                    if (isNaN(start.getTime()) || isNaN(end.getTime())) return alert('Fecha u hora inválida');
                    if (start.getTime() >= end.getTime()) return alert('La hora de inicio debe ser anterior a la hora de fin');

                    const newEvent = { title: reqTitle, start: start.toISOString(), end: end.toISOString(), description: reqDesc, location: reqLocation };
                    const updatedEvents = [...calendarEvents.map(ev => ({ ...ev, start: ev.start instanceof Date ? ev.start.toISOString() : ev.start, end: ev.end instanceof Date ? ev.end.toISOString() : ev.end })), newEvent];

                    const res = await fetch('/api/calendars', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: selectedCalendar, events: updatedEvents }) });
                    if (!res.ok) {
                      console.error('save calendar failed', await res.text());
                      return alert('Error guardando el evento');
                    }
                    // Refresh local events
                    setCalendarEvents([...calendarEvents, { ...newEvent, start: new Date(newEvent.start), end: new Date(newEvent.end) }]);
                    setRequestModalOpen(false);
                  } catch (e) {
                    console.error(e);
                    alert('Error guardando el evento');
                  }
                }}>Crear evento</button>
              ) : (
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submitRequest}>Enviar solicitud</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
