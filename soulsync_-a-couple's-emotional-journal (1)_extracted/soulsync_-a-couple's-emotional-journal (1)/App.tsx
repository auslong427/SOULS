
import React, { useState } from 'react';
import { Header } from './components/Header';
import { AIAssistant } from './components/AIAssistant';
import { BotIcon } from './components/icons/BotIcon';
import { PersonalBoard } from './components/personal-board/PersonalBoard';
import { Role } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LogoIcon } from './components/icons/LogoIcon';
import { LoginPage } from './components/LoginPage';
import { DevSettings } from './components/DevSettings';
import { Dashboard } from './components/Dashboard';
import { JournalPage } from './components/journal/JournalPage';
import { ErrorBoundary } from './components/ErrorBoundary';

export type Page = 'dashboard' | 'journal' | 'austin' | 'angie';

const AppContent: React.FC = () => {
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isDevSettingsOpen, setIsDevSettingsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [activeRole, setActiveRole] = useState<Role>('Shared');
  
  const { 
    user, 
    loading, 
    tasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTask,
    setTaskReminder
  } = useAuth();

  const austinTasks = tasks.filter(t => t.ownerName === 'Austin');
  const angieTasks = tasks.filter(t => t.ownerName === 'Angie');
  const sharedTasks = tasks.filter(t => t.ownerName === 'Shared');

  const renderPage = () => {
    if (loading && (currentPage === 'austin' || currentPage === 'angie')) {
        return (
            <div className="flex items-center justify-center p-16">
                <LogoIcon className="w-16 h-16 text-rose-500 animate-pulse" />
            </div>
        );
    }

    switch(currentPage) {
      case 'austin':
        return <PersonalBoard
          personName="Austin"
          personalTasks={austinTasks}
          partnerTasks={angieTasks}
          sharedTasks={sharedTasks}
          onTaskStatusChange={(taskId, newStatus) => updateTask(taskId, { status: newStatus })}
          onUpdateTask={(taskId, newContent) => updateTask(taskId, { content: newContent })}
          onDeleteTask={deleteTask}
          onTaskReorder={reorderTask}
          onSetTaskReminder={setTaskReminder}
          onAddTask={(content) => addTask(content, 'Austin')}
        />;
      case 'angie':
        return <PersonalBoard
          personName="Angie"
          personalTasks={angieTasks}
          partnerTasks={austinTasks}
          sharedTasks={sharedTasks}
          onTaskStatusChange={(taskId, newStatus) => updateTask(taskId, { status: newStatus })}
          onUpdateTask={(taskId, newContent) => updateTask(taskId, { content: newContent })}
          onDeleteTask={deleteTask}
          onTaskReorder={reorderTask}
          onSetTaskReminder={setTaskReminder}
          onAddTask={(content) => addTask(content, 'Angie')}
        />;
      case 'journal':
        return <JournalPage 
            activeRole={activeRole} 
            setActiveRole={setActiveRole}
            allTasks={tasks}
        />;
      case 'dashboard':
      default:
        return <Dashboard 
            onAddTask={addTask} 
            activeRole={activeRole}
            setActiveRole={setActiveRole}
        />;
    }
  }
  
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <LogoIcon className="w-24 h-24 text-rose-500 animate-pulse" />
        </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen font-sans text-indigo-950">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onOpenDevSettings={() => setIsDevSettingsOpen(true)}
      />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto pt-36 md:pt-28">
        {renderPage()}
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-all duration-300 ease-in-out"
          aria-label="Open AI Assistant"
        >
          <BotIcon className="w-8 h-8" />
        </button>
      </div>

      <AIAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />

      <DevSettings
        isOpen={isDevSettingsOpen}
        onClose={() => setIsDevSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ErrorBoundary>
    );
}