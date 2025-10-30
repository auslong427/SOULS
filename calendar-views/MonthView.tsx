import React from 'react';
import { CalendarEvent } from '../types';
import { GoogleIcon } from '../components/icons/GoogleIcon';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, onDayClick, onEventClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const today = new Date();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const eventsByDay = React.useMemo(() => {
    const map: { [key: number]: CalendarEvent[] } = {};
    events.forEach(event => {
      const eventDate = new Date(event.date.replace(/-/g, '/'));
      if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
        const dayOfMonth = eventDate.getDate();
        if (!map[dayOfMonth]) map[dayOfMonth] = [];
        map[dayOfMonth].push(event);
      }
    });
    return map;
  }, [events, year, month]);

  return (
    <div className="grid grid-cols-7 gap-1 md:gap-2 text-center">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="font-bold text-xs text-slate-500 py-2">{day}</div>
      ))}
      
      {blanks.map((_, i) => <div key={`blank-${i}`} className="border-t border-slate-200/50"></div>)}
      
      {days.map((day) => {
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const dayEvents = eventsByDay[day] || [];
        return (
          <div key={day} className="flex flex-col h-28 p-1 border-t border-slate-200/50 bg-white/30 text-left">
            <button
              onClick={() => onDayClick(new Date(year, month, day))}
              className={`w-7 h-7 flex items-center justify-center rounded-full text-sm self-end transition-colors hover:bg-sky-100 ${isToday ? 'bg-sky-500 text-white font-bold' : 'text-slate-600'}`}>
              {day}
            </button>
            <div className="mt-1 w-full space-y-0.5 overflow-hidden">
              {dayEvents.slice(0, 3).map((event) => (
                <button key={event.id} onClick={() => onEventClick(event)} className={`w-full flex items-center gap-1 text-white text-[10px] px-1 rounded-sm truncate text-left ${event.color}`}>
                  {event.type === 'google' && <GoogleIcon className="w-2 h-2 flex-shrink-0" />}
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