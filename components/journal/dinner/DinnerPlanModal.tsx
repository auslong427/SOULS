import React, { useState, useEffect } from 'react';
import { DinnerPlan } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { CloseIcon } from '../../icons/CloseIcon';
import { FoodIcon } from '../../icons/FoodIcon';
import { SpinnerIcon } from '../../icons/SpinnerIcon';
import { GoogleIcon } from '../../icons/GoogleIcon';

interface DinnerPlanModalProps {
    date: Date;
    plan: DinnerPlan | undefined;
    onClose: () => void;
}

export const DinnerPlanModal: React.FC<DinnerPlanModalProps> = ({ date, plan, onClose }) => {
    const { user, saveDinnerPlan, isGoogleCalendarConnected, updateDinnerPlanOnCalendar } = useAuth();
    const [title, setTitle] = useState(plan?.plan || '');
    const [cuisine, setCuisine] = useState(plan?.cuisine || '');
    const [whosCooking, setWhosCooking] = useState<'Austin' | 'Angie' | 'Both' | 'Eating Out'>(plan?.whosCooking || 'Both');
    const [groceries, setGroceries] = useState(plan?.groceries?.join(', ') || '');
    const [location, setLocation] = useState(plan?.location || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [syncToGoogle, setSyncToGoogle] = useState(!!plan?.calendarEventId);

    useEffect(() => {
        setSyncToGoogle(!!plan?.calendarEventId);
    }, [plan]);

    const dateString = date.toISOString().split('T')[0];

    const handleSave = async () => {
        if (!title.trim() || !user) return;
        setIsSaving(true);
        setError('');

        try {
            const dinnerData: Omit<DinnerPlan, 'updatedAt'> = {
                id: dateString,
                plan: title,
                cuisine,
                whosCooking,
                groceries: groceries.split(',').map(g => g.trim()).filter(Boolean),
                location,
                createdBy: user.uid,
                calendarEventId: plan?.calendarEventId,
            };
            
            saveDinnerPlan(dinnerData);
            
            if (isGoogleCalendarConnected) {
                await updateDinnerPlanOnCalendar({ ...dinnerData, updatedAt: Date.now() }, syncToGoogle);
            }

            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to save plan. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <header className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <FoodIcon className="w-6 h-6 text-amber-500" />
                            {plan ? 'Edit' : 'Plan'} Dinner
                        </h3>
                        <p className="text-sm text-slate-500">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <main className="p-6 space-y-4">
                    <InputField label="Plan" value={title} onChange={setTitle} placeholder="e.g., Taco Tuesday" required />
                    <InputField label="Cuisine" value={cuisine} onChange={setCuisine} placeholder="e.g., Mexican" />
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Who's Cooking?</label>
                        <div className="flex space-x-2">
                        {(['Austin', 'Angie', 'Both', 'Eating Out'] as const).map(name => (
                            <button key={name} onClick={() => setWhosCooking(name)} className={`px-3 py-1.5 rounded-full font-semibold transition-colors text-xs ${whosCooking === name ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                                {name}
                            </button>
                        ))}
                        </div>
                    </div>
                    <InputField label="Groceries (comma-separated)" value={groceries} onChange={setGroceries} placeholder="e.g., tortillas, ground beef, cheese" />
                    <InputField label="Location (Restaurant or Home)" value={location} onChange={setLocation} placeholder="e.g., Home or 'Chuy's'" />
                    
                    {isGoogleCalendarConnected && (
                        <div className="pt-4 border-t border-slate-200">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={syncToGoogle}
                                    onChange={(e) => setSyncToGoogle(e.target.checked)}
                                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <GoogleIcon className="w-5 h-5"/>
                                    Sync to Google Calendar
                                </span>
                            </label>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </main>

                <footer className="p-4 bg-slate-50 rounded-b-2xl flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving || !title.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:bg-amber-300 w-28">
                        {isSaving ? <SpinnerIcon className="w-5 h-5 mx-auto" /> : 'Save Plan'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, value: string, onChange: (val: string) => void, placeholder: string, required?: boolean }> = ({ label, value, onChange, placeholder, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
    </div>
);