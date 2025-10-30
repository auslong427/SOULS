
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Role } from '../../../types';
import { Card } from '../../Card';
import { ChefHatIcon } from '../../icons/ChefHatIcon';

interface PreferencesViewProps {
    activeRole: Role;
}

export const PreferencesView: React.FC<PreferencesViewProps> = ({ activeRole }) => {
    const { user, getDinnerPreferences, saveDinnerPreferences } = useAuth();
    const [cuisinesLiked, setCuisinesLiked] = useState('');
    const [cuisinesAvoid, setCuisinesAvoid] = useState('');
    const [dietary, setDietary] = useState('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const person = activeRole === 'Shared' ? user?.displayName : activeRole;
    const userIdToUse = (activeRole === 'Shared' ? user?.uid : activeRole.toLowerCase()) || '';

    useEffect(() => {
        if (userIdToUse) {
            const prefs = getDinnerPreferences(userIdToUse);
            if (prefs) {
                setCuisinesLiked(prefs.cuisinesLiked.join(', '));
                setCuisinesAvoid(prefs.cuisinesAvoid.join(', '));
                setDietary(prefs.dietary.join(', '));
                setNotes(prefs.notes);
            }
        }
    }, [userIdToUse, getDinnerPreferences]);

    const handleSave = () => {
        setIsSaving(true);
        saveDinnerPreferences(userIdToUse, {
            cuisinesLiked: cuisinesLiked.split(',').map(s => s.trim()).filter(Boolean),
            cuisinesAvoid: cuisinesAvoid.split(',').map(s => s.trim()).filter(Boolean),
            dietary: dietary.split(',').map(s => s.trim()).filter(Boolean),
            notes,
        });
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <Card title={`${person}'s Dinner Preferences`} icon={<ChefHatIcon className="w-6 h-6" />}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Cuisines I Love (comma-separated)</label>
                    <input 
                        type="text"
                        value={cuisinesLiked}
                        onChange={e => setCuisinesLiked(e.target.value)}
                        placeholder="e.g., Italian, Mexican, Thai"
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Cuisines to Avoid (comma-separated)</label>
                    <input 
                        type="text"
                        value={cuisinesAvoid}
                        onChange={e => setCuisinesAvoid(e.target.value)}
                        placeholder="e.g., Indian, French"
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Dietary Needs (comma-separated)</label>
                    <input 
                        type="text"
                        value={dietary}
                        onChange={e => setDietary(e.target.value)}
                        placeholder="e.g., Gluten-free, vegetarian"
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">General Notes</label>
                    <textarea 
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={3}
                        placeholder="e.g., I don't like cilantro, always up for trying new things!"
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                    />
                </div>
                <div className="flex justify-end">
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:bg-amber-300 w-36">
                        {isSaving ? 'Saved!' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </Card>
    );
};