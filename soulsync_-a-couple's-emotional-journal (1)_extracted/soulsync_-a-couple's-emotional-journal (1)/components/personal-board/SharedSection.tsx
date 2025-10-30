import React from 'react';
import { Task } from '../../types';
import { Card } from '../Card';
import { UsersIcon } from '../icons/UsersIcon';
import { PaperPlaneIcon } from '../icons/PaperPlaneIcon';

interface SharedSectionProps {
  partnerName: 'Austin' | 'Angie';
  partnerTasks: Task[];
  sharedTasks: Task[];
}

const TaskList: React.FC<{ title: string; tasks: Task[]; showReminder?: boolean }> = ({ title, tasks, showReminder = false }) => {
    const handleRemind = (taskContent: string) => {
        alert(`Gentle reminder sent about: "${taskContent}" 💌`);
    };

    return (
        <div>
            <h4 className="font-semibold text-indigo-900 mb-3">{title}</h4>
            <div className="space-y-2">
                {tasks.length > 0 ? tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-stone-50 p-3 rounded-lg border border-stone-200 text-sm">
                        <span className={`transition-opacity text-indigo-950 ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
                            {task.content}
                        </span>
                        {showReminder && task.status !== 'done' && (
                             <button onClick={() => handleRemind(task.content)} className="p-1.5 rounded-full text-amber-600 hover:bg-amber-100" aria-label="Send reminder">
                                <PaperPlaneIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )) : <p className="text-stone-500 text-sm italic py-4 text-center">No tasks here!</p>}
            </div>
        </div>
    );
};


export const SharedSection: React.FC<SharedSectionProps> = ({ partnerName, partnerTasks, sharedTasks }) => {
  return (
    <Card title="Team View" icon={<UsersIcon className="w-6 h-6" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <TaskList title="Shared To-Dos" tasks={sharedTasks} />
            <TaskList title={`${partnerName}'s To-Dos`} tasks={partnerTasks.filter(t => t.status !== 'done')} showReminder />
        </div>
    </Card>
  );
};