
import React, { useState, useEffect } from 'react';
import { Card } from '../Card';
import { MoonIcon } from '../icons/MoonIcon';
import { useAuth } from '../../contexts/AuthContext';
import { Role, Task, EveningReflectionData } from '../../types';
import { StarIcon } from '../icons/StarIcon';

interface EveningWindDownProps {
  activeRole: Role;
  allTasks: Task[];
}

const godOptions = ["In nature", "Through a conversation", "An answered prayer", "A moment of peace", "In scripture", "An act of kindness"];
const apologyOptions = ["My words", "My actions", "My tone", "Not being present", "Being impatient"];
const takeawayOptions = ["Trust God's timing", "Extend grace", "Be present", "Choose joy", "Listen more", "Let go of control"];

const ChipSelector: React.FC<{
    title: string;
    options: string[];
    selected: string[];
    onToggle: (option: string) => void;
}> = ({ title, options, selected, onToggle }) => (
    <div>
        <h4 className="font-semibold text-indigo-900 mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    onClick={() => onToggle(option)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                        selected.includes(option)
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                            : 'bg-white hover:bg-indigo-50 text-indigo-800 border-slate-300 hover:border-indigo-300'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

const StarRating: React.FC<{ rating: number; setRating: (r: number) => void }> = ({ rating, setRating }) => (
    <div className="flex items-center justify-center space-x-2">
        {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => setRating(star)} aria-label={`Rate ${star} out of 5 stars`}>
                <StarIcon className={`w-8 h-8 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-300'}`} />
            </button>
        ))}
    </div>
);


export const EveningWindDown: React.FC<EveningWindDownProps> = ({ activeRole, allTasks }) => {
  const { user, getReflection, saveReflection } = useAuth();
  const [data, setData] = useState<EveningReflectionData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const reflectionDocId = user ? `${user.uid}_${today}` : null;

  useEffect(() => {
    const loadData = () => {
      if (!reflectionDocId) return;
      setIsLoading(true);
      const reflection = getReflection(reflectionDocId);
      setData(reflection?.evening || {});
      setIsLoading(false);
    };
    loadData();
  }, [reflectionDocId, getReflection]);

  const handleSave = async () => {
    if (!reflectionDocId || !user) return;
    
    try {
        const existingReflection = getReflection(reflectionDocId) || {
            id: reflectionDocId,
            userId: user.uid,
            userName: (user.displayName || activeRole || ''),
            date: today,
            feelings: [],
            godRelationship: [],
            partnerRelationship: [],
            prayerRequest: '',
            gratitude: '',
            intention: '',
        };
        const updatedReflection = {
            ...existingReflection,
            evening: data,
        };
      saveReflection(updatedReflection as any); // Type assertion to satisfy new model
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Error saving evening wind-down: ", error);
    }
  };
  
  const handleChipToggle = (field: keyof EveningReflectionData, option: string) => {
    setData(prev => {
        const currentOptions = (prev[field] as { options: string[] })?.options || [];
        const newOptions = currentOptions.includes(option)
            ? currentOptions.filter(item => item !== option)
            : [...currentOptions, option];
        return { ...prev, [field]: { ...(prev[field] as object), options: newOptions } };
    });
  };

  const handleTextChange = (field: keyof Omit<EveningReflectionData, 'scripture' | 'highlight'> | 'scripture' | null, subfield: 'note' | 'highlight' | 'passage', value: string) => {
    if (subfield === 'highlight') {
        setData(prev => ({ ...prev, highlight: value }));
    } else if (field === 'scripture') {
        setData(prev => ({ ...prev, scripture: { ...(prev.scripture || {}), passage: value } }));
    } else if (field) {
        setData(prev => ({ ...prev, [field]: { ...(prev[field] as object), note: value } }));
    }
  };

  const isMyReflection = user?.displayName === activeRole || activeRole === 'Shared';

  if (!isMyReflection) {
    return (
        <Card title="Evening Wind-Down" icon={<MoonIcon className="w-6 h-6" />}>
            <div className="text-center p-8 text-indigo-800/70">Viewing {activeRole}'s reflection. Switch to your view to edit.</div>
        </Card>
    )
  }

  if (isLoading) {
    return (
        <Card title="Evening Wind-Down" icon={<MoonIcon className="w-6 h-6" />}>
            <div className="text-center p-8 text-indigo-800/70">Loading your evening thoughts...</div>
        </Card>
    );
  }

  return (
    <Card title="Evening Wind-Down" icon={<MoonIcon className="w-6 h-6" />}>
      <div className="space-y-8">
        <div className="text-center space-y-2">
            <h4 className="font-semibold text-indigo-900">How would you rate your day?</h4>
            <StarRating rating={data.rating || 0} setRating={(r) => setData(p => ({...p, rating: r}))} />
        </div>
        
        <ChipSelector title="How did you see God show up today?" options={godOptions} selected={data.sawGod?.options || []} onToggle={(opt) => handleChipToggle('sawGod', opt)} />
        <textarea placeholder="Any other thoughts?" value={data.sawGod?.note || ''} onChange={e => handleTextChange('sawGod', 'note', e.target.value)} rows={2} className="w-full bg-amber-50/40 border border-slate-300 rounded-lg px-4 py-2 text-sm" />
        
        <ChipSelector title="What do you need to say sorry to your spouse for?" options={apologyOptions} selected={data.apology?.options || []} onToggle={(opt) => handleChipToggle('apology', opt)} />
        <textarea placeholder="Add a personal note..." value={data.apology?.note || ''} onChange={e => handleTextChange('apology', 'note', e.target.value)} rows={2} className="w-full bg-amber-50/40 border border-slate-300 rounded-lg px-4 py-2 text-sm" />

        <div>
            <h4 className="font-semibold text-indigo-900 mb-2">Highlight of today</h4>
            <input type="text" placeholder="What was one great moment?" value={data.highlight || ''} onChange={e => handleTextChange(null, 'highlight', e.target.value)} className="w-full bg-amber-50/40 border border-slate-300 rounded-lg px-4 py-2 text-sm" />
        </div>

        <div>
            <h4 className="font-semibold text-indigo-900 mb-2">Did you take time in the Word?</h4>
            <div className="flex space-x-2">
                <button onClick={() => setData(p=>({...p, inWord: true}))} className={`px-4 py-2 rounded-lg font-semibold ${data.inWord ? 'bg-indigo-500 text-white' : 'bg-slate-200'}`}>Yes</button>
                <button onClick={() => setData(p=>({...p, inWord: false}))} className={`px-4 py-2 rounded-lg font-semibold ${data.inWord === false ? 'bg-rose-500 text-white' : 'bg-slate-200'}`}>No</button>
            </div>
            {data.inWord && <input type="text" placeholder="What did you read? (e.g., John 3:16)" value={data.scripture?.passage || ''} onChange={e => handleTextChange('scripture', 'passage', e.target.value)} className="w-full mt-2 bg-amber-50/40 border border-slate-300 rounded-lg px-4 py-2 text-sm" />}
        </div>
        
        <ChipSelector title="What takeaways does your heart need?" options={takeawayOptions} selected={data.heartTakeaways?.options || []} onToggle={(opt) => handleChipToggle('heartTakeaways', opt)} />
        <textarea placeholder="Elaborate here..." value={data.heartTakeaways?.note || ''} onChange={e => handleTextChange('heartTakeaways', 'note', e.target.value)} rows={2} className="w-full bg-amber-50/40 border border-slate-300 rounded-lg px-4 py-2 text-sm" />

        <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
            <button
                onClick={handleSave}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-all duration-300 w-36 ${
                    isSaved ? 'bg-green-500' : 'bg-rose-500 hover:bg-rose-600'
                }`}
            >
                {isSaved ? 'Saved!' : 'Save Thoughts'}
            </button>
        </div>
      </div>
    </Card>
  );
};
