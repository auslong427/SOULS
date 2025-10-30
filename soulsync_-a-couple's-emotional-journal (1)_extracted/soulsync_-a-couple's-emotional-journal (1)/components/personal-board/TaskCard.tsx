
import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../../types';
import { TrashIcon } from '../icons/TrashIcon';
import { BellIcon } from '../icons/BellIcon';
import { ReminderModal } from '../ReminderModal';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (taskId: string, newContent: string) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskReorder: (draggedId: string, targetId: string) => void;
  onSetTaskReminder: (taskId: string, reminderDate: Date | null) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateTask, onDeleteTask, onTaskReorder, onSetTaskReminder }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(task.content);
    const [isDragging, setIsDragging] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('taskId', task.id);
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };
    
    const handleSave = () => {
        if (editedContent.trim() && editedContent !== task.content) {
            onUpdateTask(task.id, editedContent);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setEditedContent(task.content);
            setIsEditing(false);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent column's drop handler from firing
        const draggedId = e.dataTransfer.getData('taskId');
        if (draggedId && draggedId !== task.id) {
            onTaskReorder(draggedId, task.id);
        }
    };

  const isDone = task.status === 'done';
  const hasReminder = !!task.reminder;

  return (
    <>
    <div
      draggable={!isDone && !isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDoubleClick={() => !isDone && setIsEditing(true)}
      className={`bg-white rounded-lg p-3 shadow-sm border border-stone-200 transition-all duration-200 relative group ${
        isDone ? 'opacity-60' : 'cursor-grab hover:shadow-md hover:border-amber-300'
      } ${isDragging ? 'opacity-40 scale-95 shadow-lg' : ''}`}
    >
        <div className="flex justify-between items-start">
          {isEditing ? (
            <input
                ref={inputRef}
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full bg-stone-100 focus:outline-none ring-2 ring-amber-400 rounded p-1 -m-1 text-sm"
            />
          ) : (
            <p className={`text-indigo-950 break-words pr-16 text-sm ${isDone ? 'line-through text-indigo-950/60' : ''}`}>
              {task.content}
            </p>
          )}

          {!isDone && !isEditing && (
             <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                    onClick={() => setIsReminderModalOpen(true)}
                    className={`p-1.5 rounded-full text-stone-400 hover:bg-stone-200 transition-colors ${hasReminder ? 'text-amber-500' : 'hover:text-amber-500'}`}
                    aria-label="Set reminder"
                >
                    <BellIcon className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-full text-stone-400 hover:text-red-500 hover:bg-stone-200 transition-colors"
                    aria-label="Delete task"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
          )}
        </div>
        {hasReminder && !isEditing && task.reminder && (
            <div className="flex items-center text-xs text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full mt-2.5 w-fit">
                <BellIcon className="w-3 h-3 mr-1.5" />
                <span>{new Date(task.reminder).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
            </div>
        )}
    </div>
    {isReminderModalOpen && (
        <ReminderModal 
            task={task}
            onClose={() => setIsReminderModalOpen(false)}
            onSetReminder={onSetTaskReminder}
        />
    )}
    </>
  );
};