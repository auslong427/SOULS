
import React, { useState } from 'react';
import { Task } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { BellIcon } from './icons/BellIcon';

interface ReminderModalProps {
  task: Task;
  onClose: () => void;
  onSetReminder: (taskId: string, reminderDate: Date | null) => void;
}

// Helper to format date for datetime-local input
const toDateTimeLocal = (date: Date | null) => {
  if (!date) return '';
  const ten = (i: number) => (i < 10 ? '0' : '') + i;
  return `${date.getFullYear()}-${ten(date.getMonth() + 1)}-${ten(date.getDate())}T${ten(date.getHours())}:${ten(date.getMinutes())}`;
};


export const ReminderModal: React.FC<ReminderModalProps> = ({ task, onClose, onSetReminder }) => {
  const [reminderDate, setReminderDate] = useState<string>(toDateTimeLocal(task.reminder ? new Date(task.reminder) : null));

  const handleSave = () => {
    if (reminderDate) {
      onSetReminder(task.id, new Date(reminderDate));
    } else {
      onSetReminder(task.id, null);
    }
    onClose();
  };

  const handleRemove = () => {
    onSetReminder(task.id, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
            <BellIcon className="w-5 h-5 mr-2 text-amber-500" />
            Set Reminder
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-stone-500 hover:bg-stone-100">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-stone-600 mb-1">Task:</p>
        <p className="bg-stone-100 p-3 rounded-lg mb-4 text-indigo-950">"{task.content}"</p>

        <div>
          <label htmlFor="reminder-datetime" className="block text-sm font-medium text-stone-600 mb-1">Reminder Date & Time</label>
          <input
            id="reminder-datetime"
            type="datetime-local"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            className="w-full bg-white/70 border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
        </div>

        <div className="mt-6 flex justify-between items-center">
            <button onClick={handleRemove} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg">
              Remove
            </button>
            <div className="flex space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg">
                Cancel
                </button>
                <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg">
                Save Reminder
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};