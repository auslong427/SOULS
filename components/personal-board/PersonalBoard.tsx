
import React from 'react';
import { Task, TaskStatus } from '../../types';
import { KanbanBoard } from './KanbanBoard';
import { SharedSection } from './SharedSection';
import { PastEntries } from '../journal/PastEntries';
import { JournalIcon } from '../icons/JournalIcon';

interface PersonalBoardProps {
  personName: 'Austin' | 'Angie';
  personalTasks: Task[];
  partnerTasks: Task[];
  sharedTasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTask: (taskId: string, newContent: string) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskReorder: (draggedId: string, targetId: string) => void;
  onSetTaskReminder: (taskId: string, reminderDate: Date | null) => void;
  onAddTask: (content: string) => void;
}

export const PersonalBoard: React.FC<PersonalBoardProps> = ({
  personName,
  personalTasks,
  partnerTasks,
  sharedTasks,
  onTaskStatusChange,
  onUpdateTask,
  onDeleteTask,
  onTaskReorder,
  onSetTaskReminder,
  onAddTask,
}) => {
  const partnerName = personName === 'Austin' ? 'Angie' : 'Austin';

  return (
    <div className="space-y-8">
      {/* Past entries for this person */}
      <PastEntries activeRole={personName} />
      <KanbanBoard
        tasks={personalTasks}
        onTaskStatusChange={onTaskStatusChange}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onTaskReorder={onTaskReorder}
        onSetTaskReminder={onSetTaskReminder}
        onAddTask={onAddTask}
      />
      <SharedSection
        partnerName={partnerName}
        partnerTasks={partnerTasks}
        sharedTasks={sharedTasks}
      />
    </div>
  );
};