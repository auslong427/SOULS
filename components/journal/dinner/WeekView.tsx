
import React, { useState, useEffect } from 'react';
import { Role, DinnerPlan } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { PlusIcon } from '../../icons/PlusIcon';
import { DinnerPlanModal } from './DinnerPlanModal';
import { TagIcon } from '../../icons/TagIcon';

interface WeekViewProps {
    activeRole: Role;
}

const getWeekDays = (date: Date): Date[] => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    start.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        return day;
    });
};

export const WeekView: React.FC<WeekViewProps> = ({ activeRole }) => {
    const { dinnerPlans } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekDays, setWeekDays] = useState<Date[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        setWeekDays(getWeekDays(currentDate));
    }, [currentDate]);

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
    };
    
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {weekDays.map(day => {
                    const dateString = day.toISOString().split('T')[0];
                    const plan = dinnerPlans.find(p => p.id === dateString);

                    return (
                        <div key={dateString} className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 flex flex-col min-h-[180px]">
                            <div className="text-center mb-3">
                                <p className="text-xs font-semibold text-slate-500">{day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</p>
                                <p className="text-xl font-bold text-indigo-900">{day.getDate()}</p>
                            </div>
                            <div className="flex-grow space-y-2 text-sm">
                                {plan ? (
                                    <button onClick={() => handleDayClick(day)} className="w-full text-left space-y-2 p-2 bg-amber-50 rounded-lg">
                                        <p className="font-bold text-amber-900">{plan.plan}</p>
                                        {plan.cuisine && <p className="text-xs text-amber-800 flex items-center gap-1"><TagIcon className="w-3 h-3"/> {plan.cuisine}</p>}
                                        {plan.groceries?.length > 0 && <span className="text-xs font-semibold bg-green-200 text-green-800 px-2 py-0.5 rounded-full">{plan.groceries.length} groceries</span>}
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <button onClick={() => handleDayClick(day)} className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed border-slate-300 text-slate-400 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-500 transition-colors">
                                            <PlusIcon className="w-6 h-6"/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {isModalOpen && selectedDate && (
                <DinnerPlanModal
                    date={selectedDate}
                    plan={dinnerPlans.find(p => p.id === selectedDate.toISOString().split('T')[0])}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};