import React from 'react';
import { CalendarEvent } from '../types';
import { GoogleIcon } from '../components/icons/GoogleIcon';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export const DayView: React.FC<DayViewProps> = ({ currentDate, events, onEventClick }) => {
  const dateStr = currentDate.toISOString().split('T')[0];
  
    const dayEvents = React.useMemo(() => {
            return events
                    .filter(e => e.date === dateStr)
                    .sort((a, b) => {
                        const ta = a.time ?? '00:00';
                        const tb = b.time ?? '00:00';
                        if (ta !== tb) return ta.localeCompare(tb);
                        return a.title.localeCompare(b.title);
                    });
    }, [events, dateStr]);

  return (
    <div className="p-4 border-t border-slate-200 min-h-[400px]">
        {dayEvents.length > 0 ? (
            <div className="space-y-3">
                {dayEvents.map(event => (
                     <button
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={`w-full flex items-center space-x-3 text-left p-3 rounded-lg ${event.color} text-white transition-transform hover:scale-105`}
                    >
                        {event.type === 'google' ? <GoogleIcon className="w-4 h-4 flex-shrink-0" /> : <div className={`w-3 h-3 rounded-full bg-white/50`} />}
                        <span className="font-semibold">{event.title}</span>
                    </button>
                ))}
            </div>
        ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
                <p>No events scheduled for this day.</p>
            </div>
        )}
    </div>
  );
};