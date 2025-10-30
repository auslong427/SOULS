import React, { useState, useMemo, useEffect } from 'react';
import { Card } from './Card';
import { CalendarIcon } from './icons/CalendarIcon';
import { useAuth } from '../contexts/AuthContext';
import { CalendarEvent } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { EventDetailModal } from './EventDetailModal';
import { MonthView } from '../calendar-views/MonthView';
import { WeekView } from '../calendar-views/WeekView';
import { DayView } from '../calendar-views/DayView';
import { GoogleIcon } from './icons/GoogleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

const colorOptions = [
  { label: 'Rose', value: 'bg-rose-400' },
  { label: 'Indigo', value: 'bg-indigo-400' },
  { label: 'Amber', value: 'bg-amber-400' },
  { label: 'Green', value: 'bg-green-400' },
  { label: 'Blue (Google)', value: 'bg-blue-400' },
];

const AddEventModal: React.FC<{
  date: Date;
  onClose: () => void;
  onSave: (title: string, color: string) => Promise<void>;
}> = ({ date, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      setIsSaving(true);
      await onSave(title, color);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-indigo-900">
            Add Event for {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-stone-500 hover:bg-stone-100" aria-label="Close add event modal">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="event-title" className="block text-sm font-medium text-stone-600 mb-1">Title</label>
              <input
                id="event-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Date Night"
                required
                className="w-full bg-white/70 border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">Color</label>
              <div className="flex space-x-3">
                {colorOptions.filter(c => c.value !== 'bg-blue-400').map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    className={`w-8 h-8 rounded-full ${opt.value} transition-transform transform hover:scale-110 ${color === opt.value ? 'ring-2 ring-offset-2 ring-amber-500' : ''}`}
                    aria-label={opt.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={isSaving || !title.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:bg-amber-300">
              {isSaving ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GoogleConnectButton: React.FC = () => {
  const { isGoogleCalendarConnected, logIn, disconnectGoogleCalendar, isGoogleSyncing, loading } = useAuth();
    
    if (isGoogleSyncing) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-stone-600 bg-stone-200 rounded-lg">
                <SpinnerIcon className="w-4 h-4" />
                <span>Syncing...</span>
            </div>
        );
    }

    if (isGoogleCalendarConnected) {
        return (
            <button 
                onClick={disconnectGoogleCalendar} 
                className="px-2 py-1 text-xs md:text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                disabled={loading}
            >
                Disconnect
            </button>
        );
    }
    
    return (
        <button 
            onClick={logIn} 
            disabled={loading}
            className="flex items-center gap-2 px-2 py-1 text-xs md:text-sm font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <GoogleIcon className="w-4 h-4" />
            {loading ? 'Connecting...' : 'Connect Google Calendar'}
        </button>
    );
};


export const Calendar: React.FC = () => {
  const { user, events, addEvent, updateEvent, deleteEvent, syncGoogleCalendarEvents } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { isGoogleCalendarConnected, isGoogleSyncing, refreshCalendarNow, lastCalendarSyncAt } = useAuth();
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  useEffect(() => {
    const doInitialSync = async () => {
      if (syncGoogleCalendarEvents && !initialSyncDone) {
        try {
          await syncGoogleCalendarEvents();
        } catch (error) {
          console.error('Initial sync failed:', error);
        } finally {
          setInitialSyncDone(true);
        }
      }
    };
    doInitialSync();
  }, [syncGoogleCalendarEvents, initialSyncDone]);
  
  const allEventsInMonth = useMemo(() => {
    return events.filter(event => {
        const eventDate = new Date(event.date.replace(/-/g, '/'));
        return eventDate.getFullYear() === currentDate.getFullYear() && eventDate.getMonth() === currentDate.getMonth();
    });
  }, [events, currentDate]);

  const handleAddEvent = async (title: string, color: string) => {
    if (!user || !selectedDate) return;
    addEvent(title, color, selectedDate.toISOString().split('T')[0]);
    setIsAddModalOpen(false);
    setSelectedDate(null);
  };

  const handleUpdateEvent = async (eventId: string, title: string, color: string, time?: string) => {
    updateEvent(eventId, { title, color, time });
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event? This may affect your Google Calendar.')) {
        deleteEvent(eventId);
        setSelectedEvent(null);
    }
  };

  const handleDayClick = (dayDate: Date) => {
    if (!user) return;
    setSelectedDate(dayDate);
    setIsAddModalOpen(true);
  };
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const increment = direction === 'prev' ? -1 : 1;
    if (view === 'month') {
        newDate.setMonth(newDate.getMonth() + increment, 1);
    } else if (view === 'week') {
        newDate.setDate(newDate.getDate() + (7 * increment));
    } else { // day
        newDate.setDate(newDate.getDate() + increment);
    }
    setCurrentDate(newDate);
  };
  
  const getHeaderTitle = () => {
    if (view === 'month') {
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (view === 'day') {
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
    if (view === 'week') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        
        const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' });
        
        if (startMonth === endMonth) {
            return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
        }
        return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
    }
  };
  
  const renderCalendarBody = () => {
    switch (view) {
        case 'month':
            return <MonthView currentDate={currentDate} events={allEventsInMonth} onDayClick={handleDayClick} onEventClick={handleEventClick} />;
        case 'week':
            return <WeekView currentDate={currentDate} events={events} onDayClick={handleDayClick} onEventClick={handleEventClick} />;
        case 'day':
            return <DayView currentDate={currentDate} events={events} onEventClick={handleEventClick} />;
        default:
            return null;
    }
  };

  const ViewButton: React.FC<{ label: string, current: string, target: string, onClick: () => void }> = ({ label, current, target, onClick }) => (
    <button onClick={onClick} className={`px-3 py-1 text-sm font-semibold rounded-md ${current === target ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'}`}>
        {label}
    </button>
  );

  return (
    <>
      <Card title="Shared Calendar" icon={<CalendarIcon className="w-6 h-6" />} headerAccessory={
        <div className="flex items-center space-x-2">
          <GoogleConnectButton />
        </div>
      }>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center space-x-1">
                <button onClick={() => handleNavigate('prev')} className="p-1.5 rounded-full text-stone-500 hover:bg-stone-100" aria-label="Previous period"><ChevronLeftIcon className="w-5 h-5"/></button>
                <h3 className="font-semibold text-indigo-900 text-sm md:text-base w-44 text-center">{getHeaderTitle()}</h3>
                <button onClick={() => handleNavigate('next')} className="p-1.5 rounded-full text-stone-500 hover:bg-stone-100" aria-label="Next period"><ChevronRightIcon className="w-5 h-5"/></button>
            </div>
            <div className="flex items-center space-x-1">
                <ViewButton label="Month" current={view} target="month" onClick={() => setView('month')} />
                <ViewButton label="Week" current={view} target="week" onClick={() => setView('week')} />
                <ViewButton label="Day" current={view} target="day" onClick={() => setView('day')} />
            </div>
        </div>
        <div>
            {renderCalendarBody()}
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-2 py-1 rounded text-sm ${
              isGoogleCalendarConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
            title={lastCalendarSyncAt ? `Last sync: ${new Date(lastCalendarSyncAt).toLocaleString()}` : 'Not synced yet'}
          >
            {isGoogleSyncing ? 'Syncing…' : isGoogleCalendarConnected ? 'Connected' : 'Disconnected'}
          </div>
          <button
            onClick={refreshCalendarNow}
            disabled={isGoogleSyncing}
            className={`px-3 py-1.5 rounded border text-sm ${
              isGoogleSyncing ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            {isGoogleSyncing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </Card>

      {isAddModalOpen && selectedDate && (
        <AddEventModal
          date={selectedDate}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddEvent}
        />
      )}

      {selectedEvent && (
        <EventDetailModal 
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onUpdate={handleUpdateEvent}
            onDelete={handleDeleteEvent}
            colorOptions={colorOptions}
        />
      )}
      <div className="mt-2 text-xs text-stone-400 text-center">Last code update detected: {new Date(document.lastModified).toLocaleString()}</div>
    </>
  );
};