import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Calendar = ({ 
  events = [], 
  onSelectEvent, 
  onSelectSlot, 
  onNavigate,
  loading = false,
  height = 600
}) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  // Transform events for react-big-calendar
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      id: event.id,
      title: event.title,
      start: new Date(event.startDate || event.start),
      end: new Date(event.endDate || event.end || event.startDate || event.start),
      allDay: event.allDay || false,
      resource: event
    }));
  }, [events]);

  const handleNavigate = useCallback((newDate) => {
    setDate(newDate);
    if (onNavigate) {
      onNavigate(newDate);
    }
  }, [onNavigate]);

  const handleSelectEvent = useCallback((event) => {
    if (onSelectEvent) {
      onSelectEvent(event.resource || event);
    }
  }, [onSelectEvent]);

  const handleSelectSlot = useCallback((slotInfo) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  }, [onSelectSlot]);

  // Event style based on event type
  const eventStyleGetter = useCallback((event) => {
    const colors = {
      task: { bg: '#3b82f6', border: '#2563eb' },
      meeting: { bg: '#8b5cf6', border: '#7c3aed' },
      inspection: { bg: '#f59e0b', border: '#d97706' },
      delivery: { bg: '#10b981', border: '#059669' },
      milestone: { bg: '#ef4444', border: '#dc2626' },
      other: { bg: '#6b7280', border: '#4b5563' }
    };

    const color = colors[event.resource?.eventType] || colors.other;
    
    return {
      style: {
        backgroundColor: event.color || color.bg,
        borderLeft: `3px solid ${color.border}`,
        color: 'white',
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '12px'
      }
    };
  }, []);

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView, view }) => (
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
        >
          Today
        </button>
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-1.5 hover:bg-gray-100 text-gray-600"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-1.5 hover:bg-gray-100 text-gray-600"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 ml-2">{label}</h2>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex border rounded-lg overflow-hidden">
          {['month', 'week', 'day', 'agenda'].map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                view === v 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg">
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}
      
      <style>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 8px;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }
        .rbc-today {
          background-color: #eff6ff;
        }
        .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        .rbc-event {
          border: none !important;
        }
        .rbc-event:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f3f4f6;
        }
        .rbc-timeslot-group {
          min-height: 60px;
        }
        .rbc-current-time-indicator {
          background-color: #ef4444;
        }
        .rbc-month-view, .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .rbc-month-row + .rbc-month-row {
          border-top: 1px solid #e5e7eb;
        }
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #e5e7eb;
        }
        .rbc-btn-group button {
          color: #374151;
        }
      `}</style>
      
      <BigCalendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height }}
        date={date}
        view={view}
        onView={setView}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar
        }}
        popup
        views={['month', 'week', 'day', 'agenda']}
      />
    </div>
  );
};

export default Calendar;

