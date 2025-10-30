import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { PlusIcon } from '../icons/PlusIcon';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTask: (taskId: string, newContent: string) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskReorder: (draggedId: string, targetId: string) => void;
  onSetTaskReminder: (taskId: string, reminderDate: Date | null) => void;
  onAddTask?: (content: string) => void;
}

const AddTaskForm: React.FC<{ onAddTask: (content: string) => void }> = ({ onAddTask }) => {
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onAddTask(content);
            setContent('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="relative">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full bg-white border border-stone-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm transition"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-amber-500">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
};


export const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, tasks, onTaskStatusChange, onUpdateTask, onDeleteTask, onTaskReorder, onSetTaskReminder, onAddTask }) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            onTaskStatusChange(taskId, status);
        }
    };

    const columnColors = {
        todo: { text: 'text-rose-600' },
        inprogress: { text: 'text-amber-600' },
        done: { text: 'text-indigo-600' },
    };
    
    const { text } = columnColors[status];

  return (
    <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-stone-100/70 rounded-xl p-4 min-h-[400px] transition-colors duration-300 ${isDraggingOver ? 'bg-amber-100 ring-2 ring-amber-400' : ''}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-semibold ${text}`}>{title}</h3>
        <span className="text-sm font-medium bg-stone-200 text-stone-700 rounded-full px-2.5 py-0.5">{tasks.length}</span>
      </div>
      {status === 'todo' && onAddTask && <AddTaskForm onAddTask={onAddTask} />}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onUpdateTask={onUpdateTask} 
            onDeleteTask={onDeleteTask} 
            onTaskReorder={onTaskReorder}
            onSetTaskReminder={onSetTaskReminder}
          />
        ))}
        {tasks.length === 0 && (
            <div className="text-center py-10">
                <p className="text-sm text-stone-500">Drop tasks here</p>
            </div>
        )}
      </div>
    </div>
  );
};