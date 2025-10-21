import React, { useCallback, useState, useMemo, Fragment } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import es from "date-fns/locale/es";
import { format, parse, startOfWeek, getDay, Locale } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { es };
interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  color?: string;
  repeat?: {
    days: number[];
    endDate: string;
    seriesId: string;
  };
  _replaceSeries?: boolean;
}

interface EventModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onDelete: (event: CalendarEvent) => void;
  onEdit: (event: CalendarEvent) => void;
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date, options?: { locale?: Locale }) =>
    startOfWeek(date, { ...options, locale: es }),
  getDay,
  locales,
});

const initialEvents: CalendarEvent[] = [
  {
    title: "Evento de ejemplo",
    start: new Date(2025, 6, 2, 10, 0),
    end: new Date(2025, 6, 2, 12, 0),
    repeat: undefined,
  },
  {
    title: "Reunión importante",
    start: new Date(2025, 6, 3, 14, 0),
    end: new Date(2025, 6, 3, 15, 30),
    repeat: undefined,
  },
];

function EventModal({ event, onClose, onDelete, onEdit }: EventModalProps) {
  const [title, setTitle] = useState(event.title);
  const [color, setColor] = useState(event.color || "#2563eb");
  const [repeat, setRepeat] = useState(!!event.repeat);
  const [days, setDays] = useState<number[]>(event.repeat?.days || []); // 1=Lunes ... 5=Viernes
  const [endDate, setEndDate] = useState<string>(event.repeat?.endDate || "");

  const weekDays = [
    { label: "Lunes", value: 1 },
    { label: "Martes", value: 2 },
    { label: "Miércoles", value: 3 },
    { label: "Jueves", value: 4 },
    { label: "Viernes", value: 5 },
  ];

  const handleDayChange = (day: number) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    if (!repeat || days.length === 0 || !endDate) {
      onEdit({ ...event, title, color, repeat: undefined });
      return;
    }
    // Solo llama a onEdit con la información necesaria, la lógica de repetición se maneja en CrudCalendar
    const seriesId =
      event.repeat?.seriesId || Math.random().toString(36).substring(2, 12);
    onEdit({
      ...event,
      title,
      color,
      repeat: repeat ? { days, endDate, seriesId } : undefined,
      _replaceSeries: repeat,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 p-8 rounded-2xl shadow-2xl w-[600px] max-w-[90vw] border border-blue-200 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-xl font-bold"
          onClick={onClose}
          title="Cerrar"
        >
          ×
        </button>
        <h2 className="text-2xl font-extrabold text-blue-700 mb-4 text-center tracking-tight">
          Editar evento
        </h2>
        <input
          className="border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-2 w-full mb-4 text-gray-700 placeholder:text-gray-400 transition"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del evento"
        />
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="repeat-event"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
            className="accent-blue-600 scale-110"
          />
          <label
            htmlFor="repeat-event"
            className="text-blue-700 font-medium cursor-pointer"
          >
            Repetir evento
          </label>
        </div>
        {repeat && (
          <div className="mb-4">
            <div className="mb-2 font-semibold text-blue-700">Días:</div>
            <div className="flex gap-2 flex-wrap mb-2">
              {weekDays.map((day) => (
                <label
                  key={day.value}
                  className={`group flex items-center gap-2 px-2 py-1 rounded-xl shadow-sm cursor-pointer border-2 transition-all duration-200 ${
                    days.includes(day.value)
                      ? "bg-blue-600 border-blue-600"
                      : "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-400"
                  }`}
                >
                  <span
                    className={`w-5 h-5 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      days.includes(day.value)
                        ? "bg-white border-blue-600"
                        : "bg-white border-blue-300 group-hover:border-blue-400"
                    }`}
                  >
                    {days.includes(day.value) && (
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={days.includes(day.value)}
                    onChange={() => handleDayChange(day.value)}
                    className="hidden"
                  />
                  <span
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      days.includes(day.value)
                        ? "text-white"
                        : "text-blue-700 group-hover:text-blue-800"
                    }`}
                  >
                    {day.label}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-2 flex items-center">
              <label className="font-semibold text-blue-700 mr-2">
                Fecha final:
              </label>
              <input
                type="date"
                className="border-2 border-blue-300 rounded-lg p-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="mb-4 flex items-center gap-3">
          <label className="text-blue-700 font-medium">
            Color del evento y repeticiones:
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-full border-2 border-blue-300 cursor-pointer shadow"
            title="Selecciona el color para el evento y sus repeticiones"
          />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition"
            onClick={handleSave}
          >
            Guardar
          </button>
          <button
            className="bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition"
            onClick={() => onDelete(event)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CrudCalendar() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [calendarName, setCalendarName] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [availableCalendars, setAvailableCalendars] = useState<any[]>([]);
  const [selectedLoadCalendar, setSelectedLoadCalendar] = useState<string | null>(
    null
  );

  // Permitir que el modal agregue eventos repetidos SOLO en entorno navegador
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).addRepeatedEvents = (evts: CalendarEvent[]) => {
        setEvents((prev) => [...prev, ...evts]);
      };
    }
  }, []);
  // Guardar calendario en la colección 'calendarios' al hacer clic en el botón
  const handleSaveCalendar = async () => {
    if (!calendarName) {
      setSaveMessage("El nombre del calendario es obligatorio.");
      return;
    }
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: calendarName, events }),
      });
      if (res.ok) {
        setSaveMessage("¡Calendario guardado correctamente!");
      } else {
        setSaveMessage("Error al guardar el calendario.");
      }
    } catch {
      setSaveMessage("Error al guardar el calendario.");
    }
    setSaving(false);
  };

  const openLoadModal = async () => {
    setLoadModalOpen(true);
    try {
      const res = await fetch("/api/calendars/list");
      const data = await res.json();
      setAvailableCalendars(data.calendars || []);
    } catch (e) {
      setAvailableCalendars([]);
    }
  };

  const handleLoadCalendar = async () => {
    if (!selectedLoadCalendar) return;
    try {
      const res = await fetch(
        `/api/calendars?name=${encodeURIComponent(selectedLoadCalendar)}`
      );
      const data = await res.json();
      if (data && Array.isArray(data.events)) {
        // map event dates
        setEvents(
          data.events.map((ev: any) => ({
            title: ev.title,
            start: new Date(ev.start),
            end: new Date(ev.end),
            color: ev.color,
          }))
        );
        setCalendarName(data.name || selectedLoadCalendar);
      }
    } catch (e) {
      // ignore
    }
    setLoadModalOpen(false);
  };

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      const title = window.prompt("Nuevo nombre de evento");
      if (title) {
        setEvents((prev) => [...prev, { start, end, title }]);
      }
    },
    []
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseModal = () => setSelectedEvent(null);

  const handleDeleteEvent = (event: CalendarEvent) => {
    setEvents((prev) => {
      if (event.repeat?.seriesId) {
        // Eliminar todos los eventos de la serie
        return prev.filter((e) => e.repeat?.seriesId !== event.repeat?.seriesId);
      }
      const idx = prev.findIndex(
        (e) =>
          e.start.getTime() === event.start.getTime() &&
          e.end.getTime() === event.end.getTime() &&
          e.title === event.title
      );
      if (idx === -1) return prev;
      const newEvents = [...prev];
      newEvents.splice(idx, 1);
      return newEvents;
    });
    handleCloseModal();
  };

  const handleEditEvent = (updatedEvent: any) => {
    setEvents((prev) => {
      // Si viene _replaceSeries, reemplaza toda la serie
      if (updatedEvent._replaceSeries) {
        const seriesId = updatedEvent.repeat?.seriesId;
        // Elimina todos los eventos de la serie
        const filtered = prev.filter((e) => e.repeat?.seriesId !== seriesId);
        // Crea el evento editado y sus repeticiones con el color seleccionado
        const newEvents: CalendarEvent[] = [
          {
            ...updatedEvent,
            color: updatedEvent.color,
          },
        ];
        const start = updatedEvent.start;
        const end = updatedEvent.end;
        const endRepeat = new Date(updatedEvent.repeat.endDate);
        const days = updatedEvent.repeat.days;
        let current = new Date(start);
        current.setDate(current.getDate() + 1); // Comenzar al día siguiente
        while (current <= endRepeat) {
          const dayOfWeek = current.getDay();
          if (days.includes(dayOfWeek)) {
            // Verifica que no exista ya un evento igual en la serie
            const exists = newEvents.some(
              (e) =>
                e.start.getTime() === current.getTime() &&
                e.end.getTime() === end.getTime() &&
                e.title === updatedEvent.title
            );
            if (!exists) {
              const startCopy = new Date(current);
              startCopy.setHours(start.getHours(), start.getMinutes(), 0, 0);
              const endCopy = new Date(current);
              endCopy.setHours(end.getHours(), end.getMinutes(), 0, 0);
              newEvents.push({
                title: updatedEvent.title,
                start: startCopy,
                end: endCopy,
                color: updatedEvent.color,
                repeat: { days, endDate: updatedEvent.repeat.endDate, seriesId },
              });
            }
          }
          current.setDate(current.getDate() + 1);
        }
        return [...filtered, ...newEvents];
      }
      if (selectedEvent?.repeat?.seriesId && updatedEvent.repeat) {
        // Eliminar todos los eventos de la serie y dejar solo el editado + los demás días seleccionados
        const filtered = prev.filter(
          (e) => e.repeat?.seriesId !== selectedEvent.repeat?.seriesId
        );
        const start = updatedEvent.start;
        const end = updatedEvent.end;
        const endRepeat = new Date(updatedEvent.repeat.endDate);
        const days = updatedEvent.repeat.days;
        const seriesId = updatedEvent.repeat.seriesId;
        const newEvents: CalendarEvent[] = [updatedEvent]; // Solo el editado
        let current = new Date(start);
        current.setDate(current.getDate() + 1); // Comenzar al día siguiente
        while (current <= endRepeat) {
          const dayOfWeek = current.getDay();
          if (days.includes(dayOfWeek)) {
            const startCopy = new Date(current);
            startCopy.setHours(start.getHours(), start.getMinutes(), 0, 0);
            const endCopy = new Date(current);
            endCopy.setHours(end.getHours(), end.getMinutes(), 0, 0);
            newEvents.push({
              title: updatedEvent.title,
              start: startCopy,
              end: endCopy,
              repeat: { days, endDate: updatedEvent.repeat.endDate, seriesId },
            });
          }
          current.setDate(current.getDate() + 1);
        }
        return [...filtered, ...newEvents];
      }
      const idx = prev.findIndex(
        (e) =>
          e.start.getTime() === selectedEvent?.start.getTime() &&
          e.end.getTime() === selectedEvent?.end.getTime() &&
          e.title === selectedEvent?.title
      );
      if (idx === -1) return prev;
      const newEvents = [...prev];
      newEvents[idx] = updatedEvent;
      return newEvents;
    });
    handleCloseModal();
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = event.color || "#2563eb";
    return {
      style: {
        backgroundColor,
        color: "#fff",
        borderRadius: "8px",
        border: "none",
        boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
        fontWeight: 600,
        letterSpacing: "0.5px",
      },
    };
  };

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 6),
    }),
    []
  );
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
  return (
    <Fragment>
      <h1 className="mb-4 text-xl md:text-2xl">Calendario CRUD</h1>
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="calendarName" className="font-semibold text-blue-700">
          Nombre del calendario:
        </label>
        <input
          id="calendarName"
          type="text"
          value={calendarName}
          onChange={(e) => setCalendarName(e.target.value)}
          className="border-2 border-blue-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition min-w-[200px]"
          placeholder="Ej. Mi calendario personal"
        />
        <button
          onClick={handleSaveCalendar}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={saving}
        >
          {saving ? "Guardando..." : "Crear o Actualizar Calendario"}
        </button>
        <button
          onClick={openLoadModal}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-bold shadow-md hover:from-green-600 hover:to-green-800 transition"
        >
          Cargar calendarios
        </button>
        {saveMessage && (
          <span
            className={
              saveMessage.includes("correctamente")
                ? "text-green-600 ml-2"
                : "text-red-600 ml-2"
            }
          >
            {saveMessage}
          </span>
        )}
      </div>
      {/* Load calendars modal */}
      {loadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-[720px] max-w-[95vw]">
            <h3 className="text-xl font-bold mb-4">
              Seleccionar calendario para cargar
            </h3>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2 mb-4">
              {availableCalendars.length === 0 ? (
                <div className="text-gray-500">No hay calendarios disponibles.</div>
              ) : (
                <ul className="space-y-2">
                  {availableCalendars.map((c: any) => (
                    <li key={c.name}>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-md p-2">
                        <input
                          type="radio"
                          name="loadCalendar"
                          value={c.name}
                          checked={selectedLoadCalendar === c.name}
                          onChange={() => setSelectedLoadCalendar(c.name)}
                        />
                        <div className="font-medium">{c.name}</div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setLoadModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleLoadCalendar}
                disabled={!selectedLoadCalendar}
              >
                Cargar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="height600">
        <Calendar
          dayLayoutAlgorithm="no-overlap"
          defaultDate={defaultDate}
          date={date}
          onNavigate={(d) => setDate(d)}
          defaultView={Views.WEEK}
          events={events}
          localizer={localizer}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          scrollToTime={scrollToTime}
          style={{ height: 500 }}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          culture="es"
        />
      </div>
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onDelete={handleDeleteEvent}
          onEdit={handleEditEvent}
        />
      )}
    </Fragment>
  );
}
