import React from 'react';
import { Task, TaskStatus } from '../../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTask: (taskId: string, newContent: string) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskReorder: (draggedId: string, targetId: string) => void;
  onSetTaskReminder: (taskId: string, reminderDate: Date | null) => void;
  onAddTask: (content: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskStatusChange, onUpdateTask, onDeleteTask, onTaskReorder, onSetTaskReminder, onAddTask }) => {
  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const inProgressTasks = tasks.filter((task) => task.status === 'inprogress');
  const doneTasks = tasks.filter((task) => task.status === 'done');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KanbanColumn
        title="To Do"
        status="todo"
        tasks={todoTasks}
        onTaskStatusChange={onTaskStatusChange}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onTaskReorder={onTaskReorder}
        onSetTaskReminder={onSetTaskReminder}
        onAddTask={onAddTask}
      />
      <KanbanColumn
        title="Doing"
        status="inprogress"
        tasks={inProgressTasks}
        onTaskStatusChange={onTaskStatusChange}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onTaskReorder={onTaskReorder}
        onSetTaskReminder={onSetTaskReminder}
      />
      <KanbanColumn
        title="Done"
        status="done"
        tasks={doneTasks}
        onTaskStatusChange={onTaskStatusChange}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onTaskReorder={onTaskReorder}
        onSetTaskReminder={onSetTaskReminder}
      />
    </div>
  );
};