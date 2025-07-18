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
  startOfWeek: (date: Date, options?: { locale?: Locale }) => startOfWeek(date, { ...options, locale: es }),
  getDay,
  locales,
});

const initialEvents = [
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

function EventModal({ event, onClose, onDelete, onEdit }: EventModalProps) {
  const [title, setTitle] = useState(event.title);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-lg font-bold mb-2">Editar evento</h2>
        <input
          className="border p-2 w-full mb-4"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => onEdit({ ...event, title })}>Guardar</button>
          <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => onDelete(event)}>Eliminar</button>
          <button className="bg-gray-300 px-3 py-1 rounded" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default function CrudCalendar() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      const title = window.prompt("Nuevo nombre de evento");
      if (title) {
        setEvents(prev => [...prev, { start, end, title }]);
      }
    },
    []
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseModal = () => setSelectedEvent(null);

  const handleDeleteEvent = (event: CalendarEvent) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.start.getTime() === event.start.getTime() && e.end.getTime() === event.end.getTime() && e.title === event.title);
      if (idx === -1) return prev;
      const newEvents = [...prev];
      newEvents.splice(idx, 1);
      return newEvents;
    });
    handleCloseModal();
  };

  const handleEditEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.start.getTime() === selectedEvent?.start.getTime() && e.end.getTime() === selectedEvent?.end.getTime() && e.title === selectedEvent?.title);
      if (idx === -1) return prev;
      const newEvents = [...prev];
      newEvents[idx] = updatedEvent;
      return newEvents;
    });
    handleCloseModal();
  };

  const { defaultDate, scrollToTime } = useMemo(() => ({
    defaultDate: new Date(2025, 6, 2),
    scrollToTime: new Date(1970, 1, 1, 6),
  }), []);

  return (
    <Fragment>
      <h1 className="mb-4 text-xl md:text-2xl">Calendario CRUD</h1>
      <div className="height600">
        <Calendar
          dayLayoutAlgorithm="no-overlap"
          defaultDate={defaultDate}
          defaultView={Views.WEEK}
          events={events}
          localizer={localizer}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          scrollToTime={scrollToTime}
          style={{ height: 500 }}
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
