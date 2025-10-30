import React from 'react';
import { CalendarEvent } from '../types';
import { GoogleIcon } from '../components/icons/GoogleIcon';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({ currentDate, events, onDayClick, onEventClick }) => {
  const today = new Date();

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays(currentDate);

  const eventsByDate = React.useMemo(() => {
    const map: { [key: string]: CalendarEvent[] } = {};
    events.forEach(event => {
      const dateStr = event.date;
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(event);
    });
    return map;
  }, [events]);

  return (
    <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200">
      {weekDays.map((day, index) => {
        const isToday = day.toDateString() === today.toDateString();
        const dateStr = day.toISOString().split('T')[0];
        const dayEvents = (eventsByDate[dateStr] || []).sort((a, b) => {
          const ta = a.time ?? '00:00';
          const tb = b.time ?? '00:00';
          if (ta !== tb) return ta.localeCompare(tb);
          return a.title.localeCompare(b.title);
        });

        return (
          <div key={index} className="flex flex-col bg-slate-50 min-h-[400px]">
            <div className="text-center py-2 border-b border-slate-200">
              <p className="text-xs text-slate-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
              <button 
                onClick={() => onDayClick(day)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-lg mx-auto mt-1 transition-colors hover:bg-sky-100 ${isToday ? 'bg-sky-500 text-white' : 'text-slate-700'}`}
              >
                {day.getDate()}
              </button>
            </div>
            <div className="p-2 space-y-1 overflow-y-auto">
              {dayEvents.map(event => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={`w-full flex items-center gap-2 text-white text-xs p-2 rounded-md text-left ${event.color}`}
                >
                  {event.type === 'google' && <GoogleIcon className="w-3 h-3 flex-shrink-0" />}
                  <span className="truncate">{event.title}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};