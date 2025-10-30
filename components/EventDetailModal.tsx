import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { GoogleIcon } from './icons/GoogleIcon';

interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdate: (eventId: string, title: string, color: string, time?: string) => void;
  onDelete: (eventId: string) => void;
  colorOptions: { label: string, value: string }[];
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onUpdate, onDelete, colorOptions }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [color, setColor] = useState(event.color);
  const [time, setTime] = useState(event.time || '');
  
  const isGoogleEvent = event.type === 'google';

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(event.id!, title, color, time);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onDelete(event.id!);
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <header className="flex items-center justify-between p-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-indigo-950">
            Event Details
          </h3>
          <button onClick={onClose} className="p-2 rounded-full text-stone-500 hover:bg-stone-100" aria-label="Close event details">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <label htmlFor="event-title-input" className="sr-only">Event title</label>
              <input
                id="event-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                aria-label="Event title"
                className="w-full text-xl font-bold bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <label htmlFor="event-time-input" className="sr-only">Event time</label>
              <input
                id="event-time-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Event time"
                aria-label="Event time"
                className="w-full text-lg bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
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
          ) : (
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${event.color} flex-shrink-0`} />
                <h4 className="text-xl font-bold text-indigo-950">{event.title}</h4>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-stone-500">
                    {new Date(event.date.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                {event.time && <p className="text-stone-500">{event.time}</p>}
                {isGoogleEvent && (
                    <span className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
                        <GoogleIcon className="w-3 h-3" />
                        Google Calendar
                    </span>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="p-4 bg-stone-50 rounded-b-2xl flex justify-between items-center">
            <button onClick={handleDelete} className="p-2 text-stone-500 hover:text-red-500 hover:bg-red-100 rounded-full" aria-label="Delete event"><TrashIcon className="w-5 h-5"/></button>
            <div className="flex space-x-3">
            {isEditing ? (
                <>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-semibold text-stone-600 bg-stone-200 hover:bg-stone-300 rounded-lg">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg">Save Changes</button>
                </>
            ) : (
                <>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-stone-600 hover:bg-stone-700 rounded-lg"><EditIcon className="w-4 h-4"/>Edit</button>
                <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600 bg-stone-200 hover:bg-stone-300 rounded-lg">Close</button>
                </>
            )}
            </div>
        </footer>
      </div>
    </div>
  );
};