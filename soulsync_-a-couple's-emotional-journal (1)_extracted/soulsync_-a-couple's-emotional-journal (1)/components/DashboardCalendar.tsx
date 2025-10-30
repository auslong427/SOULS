
import React, { useMemo } from 'react';
import { Card } from './Card';
import { CalendarIcon } from './icons/CalendarIcon';
import { useAuth } from '../contexts/AuthContext';
import { CalendarEvent } from '../types';

const EventItem: React.FC<{ event: CalendarEvent }> = ({ event }) => (
    <div className="flex items-start space-x-3">
        <div className={`w-2 h-2 rounded-full mt-2 ${event.color}`} />
        <div>
            <p className="font-semibold text-indigo-900">{event.title}</p>
            <p className="text-xs text-stone-500">
                {new Date(event.date.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
        </div>
    </div>
);

export const DashboardCalendar: React.FC = () => {
    const { events, loading } = useAuth();

    const { todayEvents, upcomingEvents } = useMemo(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];

        const relevantEvents = events
            .filter(e => e.date >= todayStr && e.date <= nextWeekStr)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const todayEv: CalendarEvent[] = [];
        const upcomingEv: CalendarEvent[] = [];

        relevantEvents.forEach(event => {
            if (event.date === todayStr) {
                todayEv.push(event);
            } else {
                upcomingEv.push(event);
            }
        });
        return { todayEvents: todayEv, upcomingEvents: upcomingEv };
    }, [events]);

    const renderContent = () => {
        if (loading) return <p className="text-stone-500 text-sm p-4">Loading agenda...</p>;
        
        if (todayEvents.length === 0 && upcomingEvents.length === 0) {
            return <p className="text-stone-500 text-sm p-4">Your week is clear! Add an event in the calendar.</p>;
        }

        return (
            <div className="space-y-4">
                {todayEvents.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-stone-600 mb-2 pb-2 border-b border-stone-200">Today</h4>
                        <div className="space-y-3">
                            {todayEvents.map(event => <EventItem key={event.id} event={event} />)}
                        </div>
                    </div>
                )}
                {upcomingEvents.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-stone-600 mb-2 pb-2 border-b border-stone-200">This Week</h4>
                         <div className="space-y-3">
                            {upcomingEvents.map(event => <EventItem key={event.id} event={event} />)}
                        </div>
                    </div>
                )}
            </div>
        )
    };

    return (
        <Card title="Today's Agenda" icon={<CalendarIcon className="w-6 h-6" />}>
            {renderContent()}
        </Card>
    );
};