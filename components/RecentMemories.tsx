
import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { RewindIcon } from './icons/RewindIcon';
import { useAuth } from '../contexts/AuthContext';
import { CalendarEvent } from '../types';

const formatRelativeDate = (dateString: string): string => {
    const eventDate = new Date(dateString.replace(/-/g, '/'));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - eventDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return 'Yesterday';
    }
    if (diffDays > 1 && diffDays <= 7) {
        return `${diffDays} days ago`;
    }
    return eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};


const MemoryItem: React.FC<{ event: CalendarEvent }> = ({ event }) => (
    <div className="flex items-start space-x-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 ${event.color}`} />
        <div>
            <p className="font-semibold text-slate-700 text-sm">{event.title}</p>
            <p className="text-xs text-slate-500">
                {formatRelativeDate(event.date)}
            </p>
        </div>
    </div>
);

export const RecentMemories: React.FC = () => {
    const { events, loading } = useAuth();
    const [memories, setMemories] = useState<CalendarEvent[]>([]);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
        
        const recentEvents = events
            .filter(event => event.date >= threeDaysAgoStr && event.date < todayStr)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
        setMemories(recentEvents);
    }, [events]);

    const renderContent = () => {
        if (loading) {
            return <p className="text-slate-500 text-sm p-4 text-center">Loading recent memories...</p>;
        }
        if (memories.length === 0) {
            return <p className="text-slate-500 text-sm p-4 text-center">No recent memories from the past few days.</p>;
        }
        return (
            <div className="space-y-3">
                {memories.map(event => <MemoryItem key={event.id} event={event} />)}
            </div>
        );
    };

    return (
        <Card title="Recent Memories" icon={<RewindIcon className="w-6 h-6" />}>
            {renderContent()}
        </Card>
    );
};