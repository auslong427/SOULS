import React, { useState } from 'react';
import { Role } from '../../../types';
import { WeekView } from './WeekView';
import { PreferencesView } from './PreferencesView';
import { ChefHatIcon } from '../../icons/ChefHatIcon';
import { ListIcon } from '../../icons/ListIcon';

interface DinnerPlannerProps {
    activeRole: Role;
}

type DinnerView = 'week' | 'preferences';

export const DinnerPlanner: React.FC<DinnerPlannerProps> = ({ activeRole }) => {
    const [view, setView] = useState<DinnerView>('week');
    
    return (
        <div>
            <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-lg border bg-white p-1.5 space-x-2">
                    <button onClick={() => setView('week')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 ${view === 'week' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <ListIcon className="w-5 h-5" />
                        Week View
                    </button>
                    <button onClick={() => setView('preferences')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 ${view === 'preferences' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <ChefHatIcon className="w-5 h-5" />
                        Preferences
                    </button>
                </div>
            </div>
            {view === 'week' ? <WeekView activeRole={activeRole} /> : <PreferencesView activeRole={activeRole} />}
        </div>
    );
};
