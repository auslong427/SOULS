import React, { useState } from 'react';
import { Role, Task } from '../../types';
import { RoleFilter } from './RoleFilter';
import { MorningReflection } from './MorningReflection';
import { EveningWindDown } from './EveningWindDown';
import { DinnerPlanner } from './dinner/DinnerPlanner';
import { PastEntries } from './PastEntries';

type JournalView = 'morning' | 'dinner' | 'evening';

const JournalNav: React.FC<{
    activeView: JournalView,
    setView: (view: JournalView) => void
}> = ({ activeView, setView }) => {
    const navItems: { id: JournalView, label: string }[] = [
        { id: 'morning', label: 'Morning Reflection' },
        { id: 'dinner', label: 'Dinner Planning' },
        { id: 'evening', label: 'Evening Wind-Down' },
    ];
    return (
        <nav className="flex items-center justify-center space-x-2 sm:space-x-4 border-b border-slate-200 mb-8 pb-4">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm sm:text-base ${
                        activeView === item.id 
                            ? 'bg-amber-500 text-white' 
                            : 'text-indigo-800 hover:bg-amber-100/60'
                    }`}
                >
                    {item.label}
                </button>
            ))}
        </nav>
    );
};

interface JournalPageProps {
    activeRole: Role;
    setActiveRole: (role: Role) => void;
    allTasks: Task[];
}

export const JournalPage: React.FC<JournalPageProps> = ({ activeRole, setActiveRole, allTasks }) => {
    const [view, setView] = useState<JournalView>('morning');

    const renderContent = () => {
        switch (view) {
            case 'morning':
                return <MorningReflection activeRole={activeRole} />;
            case 'dinner':
                return <DinnerPlanner activeRole={activeRole} />;
            case 'evening':
                return <EveningWindDown activeRole={activeRole} allTasks={allTasks} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="space-y-8">
            <RoleFilter activeRole={activeRole} setRole={setActiveRole} />
            <JournalNav activeView={view} setView={setView} />
            <div>
                {renderContent()}
            </div>
            <PastEntries activeRole={activeRole} />
        </div>
    );
};