import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { HomeIcon } from './icons/HomeIcon';
import { Reflection, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { HeartIcon } from './icons/HeartIcon';
import { PrayingHandsIcon } from './icons/PrayingHandsIcon';
import { PlusIcon } from './icons/PlusIcon';
import { Calendar } from './Calendar';
import { DashboardCalendar } from './DashboardCalendar';
import { ReflectionDetailModal } from './ReflectionDetailModal';
import { SparkleIcon } from './icons/SparkleIcon';
import { RecentMemories } from './RecentMemories';
import { FeatureFeedback } from './FeatureFeedback';
import { RoleFilter } from './journal/RoleFilter';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

const AddTaskPanel: React.FC<{ onAddTask: (content: string, ownerName: 'Austin' | 'Angie' | 'Shared') => void }> = ({ onAddTask }) => {
    const [content, setContent] = useState('');
    const [owner, setOwner] = useState<'Shared' | 'Austin' | 'Angie'>('Shared');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onAddTask(content, owner);
            setContent('');
        }
    };
    
    return (
        <div className="mt-4">
            <h3 className="font-semibold text-indigo-900 mb-3">Add a Shared Task</h3>
            <div className="flex space-x-2">
                <div className="flex-grow">
                    {(['Shared', 'Austin', 'Angie'] as const).map(name => (
                        <button 
                            key={name}
                            onClick={() => setOwner(name)}
                            className={`px-3 py-1.5 rounded-full font-semibold transition-colors text-xs ${owner === name ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'}`}>
                                {name}
                        </button>
                    ))}
                </div>
            </div>
            <form onSubmit={handleSubmit} className="mt-2">
                <div className="relative">
                     <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="e.g., Plan weekend trip"
                        className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm transition"
                    />
                    <button type="submit" aria-label="Add task" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-amber-500">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

const TodaysConnection: React.FC<{onAddTask: (content: string, ownerName: 'Austin' | 'Angie' | 'Shared') => void}> = ({onAddTask}) => {
    const { reflections } = useAuth();
    const [todaysPrayers, setTodaysPrayers] = useState<{name: string, prayer: string}[]>([]);
    const [expanded, setExpanded] = useState(false);
    
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const prayers = reflections
            .filter(r => r.date === today && r.prayerRequest)
            .map(r => ({ name: r.userName, prayer: r.prayerRequest }));
        setTodaysPrayers(prayers);
    }, [reflections]);


    return (
        <Card title="Today's Connection" icon={<HeartIcon className="w-6 h-6 text-rose-500" />}>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-indigo-900 mb-2 flex items-center"><PrayingHandsIcon className="w-5 h-5 mr-2" />On Our Hearts Today</h3>
                        {todaysPrayers.length > 1 &&
                          <button onClick={() => setExpanded(!expanded)} aria-label="Toggle expand prayers" className="text-indigo-600 hover:text-indigo-900">
                              <ChevronRightIcon className={`w-5 h-5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                          </button>
                        }
                    </div>
                    {reflections.length > 0 && todaysPrayers.length === 0 && <p className="text-stone-500 text-sm italic">No prayer requests shared yet today.</p>}
                    <div className="space-y-2">
                        {todaysPrayers.slice(0, expanded ? todaysPrayers.length : 1).map((p, i) => (
                            <div key={i} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <p className="font-bold text-indigo-900 text-sm">{p.name}</p>
                                <p className="text-indigo-950/80 text-sm italic">"{p.prayer}"</p>
                            </div>
                        ))}
                    </div>
                </div>
                <AddTaskPanel onAddTask={onAddTask} />
            </div>
        </Card>
    );
};

const TodaysNeeds: React.FC = () => {
    const { reflections } = useAuth();
    const [todaysNeeds, setTodaysNeeds] = useState<{name: string, need: string}[]>([]);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const needs = reflections
            .filter(r => r.date === today && r.loveNeed)
            .map(r => ({ name: r.userName, need: r.loveNeed || '' }));
        setTodaysNeeds(needs);
    }, [reflections]);

    return (
        <Card title="Today's Needs" icon={<HeartIcon className="w-6 h-6 text-rose-500" />}>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-indigo-900 mb-2 flex items-center"><HeartIcon className="w-5 h-5 mr-2" />How your partner can show you love</h3>
                    {todaysNeeds.length > 1 &&
                      <button onClick={() => setExpanded(!expanded)} aria-label="Toggle expand needs" className="text-indigo-600 hover:text-indigo-900">
                          <ChevronRightIcon className={`w-5 h-5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                      </button>
                    }
                </div>
                {reflections.length > 0 && todaysNeeds.length === 0 && <p className="text-stone-500 text-sm italic">No needs shared yet today.</p>}
                <div className="space-y-2">
                    {todaysNeeds.slice(0, expanded ? todaysNeeds.length : 1).map((n, i) => (
                        <div key={i} className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                            <p className="font-bold text-rose-900 text-sm">{n.name}</p>
                            <p className="text-rose-950/80 text-sm italic">"{n.need}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

const OurStoryFeed: React.FC<{ activeRole: Role }> = ({ activeRole }) => {
    const { reflections: allReflections, loading } = useAuth();
    const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);

    const reflections = allReflections
        .filter(r => activeRole === 'Shared' || r.userName === activeRole)
        .sort((a, b) => b.createdAt - a.createdAt);


    const handleReflectionClick = (reflection: Reflection) => {
        setSelectedReflection(reflection);
    };

    return (
        <>
            <Card title="Our Story" icon={<HomeIcon className="w-6 h-6" />}>
                {loading && <p className="text-stone-500">Loading our story...</p>}
                {!loading && reflections.length === 0 && (
                    <div className="text-center py-12 bg-stone-50 rounded-lg">
                        <p className="text-indigo-900 font-medium">Your story begins here.</p>
                        <p className="text-sm text-stone-500 mt-1">Complete a Morning Reflection in the Journal to add an entry.</p>
                    </div>
                )}
                <div className="space-y-6">
                    {reflections.map(reflection => (
                        <div 
                            key={reflection.id} 
                            onClick={() => handleReflectionClick(reflection)}
                            className="bg-white rounded-xl border border-stone-200/80 overflow-hidden cursor-pointer group transition-shadow duration-300 hover:shadow-lg"
                        >
                            {reflection.imageUrl && (
                                <div className="overflow-hidden">
                                    <img src={reflection.imageUrl} alt="Reflection memory" className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
                                </div>
                            )}
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="font-bold text-indigo-950 text-lg">{reflection.userName}</p>
                                    <p className="text-xs text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full font-medium">{new Date(reflection.date.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div className="space-y-3">
                                    {reflection.gratitude && (
                                        <div className="flex items-start text-sm">
                                            <SparkleIcon className="w-4 h-4 text-amber-500 mr-2.5 mt-0.5 flex-shrink-0" />
                                            <p className="text-indigo-950/80">
                                                <span className="font-semibold text-indigo-950">Grateful for:</span> {reflection.gratitude}
                                            </p>
                                        </div>
                                    )}
                                    {reflection.intention && (
                                        <div className="flex items-start text-sm">
                                            <HeartIcon className="w-4 h-4 text-rose-500 mr-2.5 mt-0.5 flex-shrink-0" />
                                            <p className="text-indigo-950/80">
                                                <span className="font-semibold text-indigo-950">Intention:</span> {reflection.intention}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right mt-4 pt-4 border-t border-stone-200/80">
                                    <span className="text-sm font-semibold text-amber-700 group-hover:underline">View Full Reflection &rarr;</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            {selectedReflection && (
                <ReflectionDetailModal 
                    reflection={selectedReflection} 
                    onClose={() => setSelectedReflection(null)} 
                />
            )}
        </>
    );
};

interface DashboardProps {
    onAddTask: (content: string, ownerName: 'Austin' | 'Angie' | 'Shared') => void;
    activeRole: Role;
    setActiveRole: (role: Role) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({onAddTask, activeRole, setActiveRole}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
            <RoleFilter activeRole={activeRole} setRole={setActiveRole} />
            <TodaysConnection onAddTask={onAddTask} />
            <TodaysNeeds />
            <RecentMemories />
            <FeatureFeedback />
        </div>
        <div className="lg:col-span-2 space-y-8">
            <DashboardCalendar />
            <Calendar />
            <OurStoryFeed activeRole={activeRole} />
        </div>
    </div>
  );
};