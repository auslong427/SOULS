
import React, { useState, useEffect } from 'react';
import { Card } from '../Card';
import { SunIcon } from '../icons/SunIcon';
import { SparkleIcon } from '../icons/SparkleIcon';
import { HeartIcon } from '../icons/HeartIcon';
import { PrayingHandsIcon } from '../icons/PrayingHandsIcon';
import { CrossIcon } from '../icons/CrossIcon';
import { useAuth } from '../../contexts/AuthContext';
import { ImageUploader } from '../ImageUploader';
import { ImageIcon } from '../icons/ImageIcon';
import { MicIcon } from '../icons/MicIcon';
import { VoiceJournalModal } from '../VoiceJournalModal';
import { Feeling, Role, Reflection } from '../../types';
import { GoogleGenAI } from '@google/genai';
import { PlusIcon } from '../icons/PlusIcon';
import { SpinnerIcon } from '../icons/SpinnerIcon';

const categorizedFeelings: { [key: string]: { emoji: string, label: string }[] } = {
  "Positive & Uplifting": [
    { emoji: '😊', label: 'Peaceful' }, { emoji: '✨', label: 'Hopeful' }, { emoji: '😄', label: 'Joyful' }, { emoji: '🔗', label: 'Connected' }, 
    { emoji: '🎨', label: 'Creative' }, { emoji: '🙏', label: 'Grateful' }, { emoji: '🚀', label: 'Motivated' }, { emoji: '🤪', label: 'Playful' }, { emoji: '💖', label: 'Loved' }
  ],
  "Challenging & Difficult": [
    { emoji: '😥', label: 'Anxious' }, { emoji: '🤯', label: 'Stressed' }, { emoji: '😫', label: 'Overwhelmed' }, { emoji: '😠', label: 'Frustrated' }, { emoji: '😔', label: 'Lonely' }
  ],
  "Reflective & Somatic": [
    { emoji: '😴', label: 'Tired' }, { emoji: '🤔', label: 'Reflective' }
  ]
};

const allPredefinedFeelings: Feeling[] = Object.values(categorizedFeelings).flat().map(f => ({
    id: `${f.emoji} ${f.label}`,
    label: `${f.emoji} ${f.label}`,
    emoji: f.emoji,
    source: 'predefined'
}));

const allFeelingOptions = allPredefinedFeelings.map(f => f.label);


const godRelationshipOptions = [
    'Close', 'Distant', 'Seeking', 'Content', 
    'Unsure', 'Wrestling', 'Hopeful', 'Thankful', 
    'Confused', 'Listening', 'Growing', 'Resting'
];
const partnerRelationshipOptions = [
    'United', 'Disconnected', 'Supportive', 'Tense', 
    'Loving', 'Playful', 'Collaborative', 'Distant',
    'Appreciated', 'Patient', 'Excited', 'Secure'
];

const PillButton: React.FC<{
    text: string;
    isSelected: boolean;
    onClick: () => void;
}> = ({ text, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
            isSelected
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white hover:bg-amber-50 text-indigo-800 border-slate-300 hover:border-amber-300'
        }`}
    >
        {text}
    </button>
);

const ReflectionSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="space-y-3">
        <div className="flex items-center">
            <div className="text-amber-500 mr-2.5">{icon}</div>
            <h3 className="font-semibold text-indigo-900">{title}</h3>
        </div>
        {children}
    </div>
);

const initialState = {
    selectedFeelings: [],
    godRelationship: [],
    partnerRelationship: [],
    prayerRequest: '',
    gratitude: '',
    intention: '',
    imageUrl: '',
};

interface MorningReflectionProps {
    activeRole: Role;
}

export const MorningReflection: React.FC<MorningReflectionProps> = ({ activeRole }) => {
    const { user, getReflection, saveReflection } = useAuth();
    const [selectedFeelings, setSelectedFeelings] = useState<Feeling[]>(initialState.selectedFeelings);
    const [godRelationship, setGodRelationship] = useState<string[]>(initialState.godRelationship);
    const [partnerRelationship, setPartnerRelationship] = useState<string[]>(initialState.partnerRelationship);
    const [prayerRequest, setPrayerRequest] = useState(initialState.prayerRequest);
    const [gratitude, setGratitude] = useState(initialState.gratitude);
    const [intention, setIntention] = useState(initialState.intention);
    const [imageUrl, setImageUrl] = useState(initialState.imageUrl);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);

    const [showCustomFeelingInput, setShowCustomFeelingInput] = useState(false);
    const [customFeelingText, setCustomFeelingText] = useState('');
    const [isCreatingFeeling, setIsCreatingFeeling] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    
    // Determine which user's reflection to show/edit based on role
    const reflectionUser = (activeRole === 'Shared' || activeRole === user?.displayName) ? user : { uid: activeRole.toLowerCase(), displayName: activeRole };
    const docId = reflectionUser ? `${reflectionUser.uid}_${today}` : null;


    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            setIsSpeechRecognitionSupported(true);
        }
    }, []);

    const resetForm = () => {
        setSelectedFeelings(initialState.selectedFeelings);
        setGodRelationship(initialState.godRelationship);
        setPartnerRelationship(initialState.partnerRelationship);
        setPrayerRequest(initialState.prayerRequest);
        setGratitude(initialState.gratitude);
        setIntention(initialState.intention);
        setImageUrl(initialState.imageUrl);
    };

    useEffect(() => {
        const loadReflection = () => {
            if (!docId) return;
            setIsLoading(true);
            const data = getReflection(docId);

            if (data) {
                // Handle both old string[] and new Feeling[] formats
                const feelingsData = data.feelings || [];
                if (feelingsData.length > 0 && typeof feelingsData[0] === 'string') {
                    // Fix: Explicitly type the map callback to ensure correct type inference for `source`.
                    const migratedFeelings = (feelingsData as string[]).map((label: string): Feeling => {
                        return allPredefinedFeelings.find(f => f.label === label) || { id: label, label, emoji: '✨', source: 'custom' };
                    });
                    setSelectedFeelings(migratedFeelings);
                } else {
                    setSelectedFeelings(feelingsData as Feeling[]);
                }
                
                setGodRelationship(data.godRelationship || []);
                setPartnerRelationship(data.partnerRelationship || []);
                setPrayerRequest(data.prayerRequest || '');
                setGratitude(data.gratitude || '');
                setIntention(data.intention || '');
                setImageUrl(data.imageUrl || '');
            } else {
                resetForm();
            }
            setIsLoading(false);
        };
        loadReflection();
    }, [docId, getReflection]);

    const isFormEmpty =
        selectedFeelings.length === 0 &&
        godRelationship.length === 0 &&
        partnerRelationship.length === 0 &&
        !prayerRequest.trim() &&
        !gratitude.trim() &&
        !intention.trim() &&
        !imageUrl;

    const handleSave = async () => {
        if (!docId || !user || isFormEmpty) return;
        
        const reflectionData = {
            id: docId,
            userId: user.uid,
            userName: (user.displayName || activeRole || ''),
            date: today,
            feelings: selectedFeelings,
            godRelationship,
            partnerRelationship,
            prayerRequest,
            gratitude,
            intention,
            imageUrl: imageUrl || '',
        };

        saveReflection(reflectionData as Reflection);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
        setter(prev =>
            prev.includes(item)
                ? prev.filter(i => i !== item)
                : [...prev, item]
        );
    };

    const toggleFeelingSelection = (feeling: Feeling) => {
        setSelectedFeelings(prev => 
            prev.some(f => f.id === feeling.id)
                ? prev.filter(f => f.id !== feeling.id)
                : [...prev, feeling]
        );
    };

    const handleAddCustomFeeling = async () => {
        if (!customFeelingText.trim()) return;
        setIsCreatingFeeling(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Suggest a single, appropriate emoji for the feeling: "${customFeelingText}". Respond with only the emoji.`,
            });
            let emoji = (response.text ?? '').trim().match(/\p{Emoji}/u)?.[0] || '✨';
            
            const newFeeling: Feeling = {
                id: `custom-${Date.now()}`,
                label: `${emoji} ${customFeelingText}`,
                emoji,
                source: 'custom',
            };
            setSelectedFeelings(prev => [...prev, newFeeling]);
            setCustomFeelingText('');
            setShowCustomFeelingInput(false);
        } catch (error) {
            console.error("Error getting emoji:", error);
            // Fallback
            const newFeeling: Feeling = { id: `custom-${Date.now()}`, label: `✨ ${customFeelingText}`, emoji: '✨', source: 'custom' };
            setSelectedFeelings(prev => [...prev, newFeeling]);
        } finally {
            setIsCreatingFeeling(false);
        }
    };


    const handleVoiceJournalUpdate = (data: any) => {
       // Voice journal logic can be updated here to support new feeling structure
    };

    const voiceButton = isSpeechRecognitionSupported ? (
        <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="p-2 rounded-full text-indigo-700 hover:bg-amber-100 transition-colors"
            aria-label="Journal with your voice"
            title="Journal with your voice"
        >
            <MicIcon className="w-5 h-5" />
        </button>
    ) : null;

    if (isLoading) {
        return (
             <Card title="Morning Reflection" icon={<SunIcon className="w-6 h-6" />}>
                <div className="text-center p-8 text-indigo-800/70">Loading reflection...</div>
             </Card>
        );
    }
    
    const isMyReflection = user?.displayName === activeRole || activeRole === 'Shared';

    if (!isMyReflection) {
        return (
            <Card title="Morning Reflection" icon={<SunIcon className="w-6 h-6" />}>
                <div className="text-center p-8 text-indigo-800/70">Viewing {activeRole}'s reflection. Switch to your view to edit.</div>
            </Card>
        )
    }

    return (
        <>
            <Card title="Morning Reflection" icon={<SunIcon className="w-6 h-6" />} headerAccessory={voiceButton}>
                <div className="text-center mb-6 -mt-2">
                    <p className="text-sm text-indigo-800/70">A new day, a fresh start. Select as many options as you feel fit.</p>
                </div>
                <div className="space-y-8">

                    <ReflectionSection title="How are you feeling today?" icon={<SparkleIcon className="w-5 h-5 text-amber-500" />}>
                       <div className="space-y-4">
                            {Object.entries(categorizedFeelings).map(([category, feelings]) => (
                                <div key={category}>
                                    <h4 className="text-sm font-semibold text-indigo-900/90 mb-2 tracking-wide">{category}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {feelings.map(feeling => (
                                            <PillButton
                                                key={`${feeling.emoji} ${feeling.label}`}
                                                text={`${feeling.emoji} ${feeling.label}`}
                                                isSelected={selectedFeelings.some(f => f.label === `${feeling.emoji} ${feeling.label}`)}
                                                onClick={() => toggleFeelingSelection({ id: `${feeling.emoji} ${feeling.label}`, label: `${feeling.emoji} ${feeling.label}`, emoji: feeling.emoji, source: 'predefined' })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {/* Custom feelings section */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                {selectedFeelings.filter(f => f.source === 'custom').map(feeling => (
                                    <PillButton
                                        key={feeling.id}
                                        text={feeling.label}
                                        isSelected={true}
                                        onClick={() => toggleFeelingSelection(feeling)}
                                    />
                                ))}
                                {!showCustomFeelingInput && (
                                    <button onClick={() => setShowCustomFeelingInput(true)} aria-label="Add custom feeling" className="flex items-center justify-center w-10 h-9 rounded-full border border-dashed border-slate-400 text-slate-500 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-600 transition-colors">
                                        <PlusIcon className="w-5 h-5"/>
                                    </button>
                                )}
                                {showCustomFeelingInput && (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text"
                                            value={customFeelingText}
                                            onChange={(e) => setCustomFeelingText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomFeeling()}
                                            placeholder="Add custom feeling..."
                                            className="px-3 py-1.5 rounded-full text-sm border-slate-300 border focus:ring-amber-400 focus:border-amber-400"
                                            autoFocus
                                        />
                                        <button onClick={handleAddCustomFeeling} disabled={isCreatingFeeling} className="px-3 py-1.5 bg-amber-500 text-white rounded-full text-sm font-semibold disabled:bg-amber-300">
                                            {isCreatingFeeling ? <SpinnerIcon className="w-4 h-4"/> : 'Add'}
                                        </button>
                                        <button onClick={() => setShowCustomFeelingInput(false)} className="text-sm text-slate-500 hover:underline">Cancel</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ReflectionSection>
                    
                    <hr className="border-slate-200/80" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ReflectionSection title="Relationship with God" icon={<CrossIcon className="w-5 h-5" />}>
                            <div className="flex flex-wrap gap-2">
                                {godRelationshipOptions.map(option => (
                                    <PillButton
                                        key={option}
                                        text={option}
                                        isSelected={godRelationship.includes(option)}
                                        onClick={() => toggleSelection(setGodRelationship, option)}
                                    />
                                ))}
                            </div>
                        </ReflectionSection>
                        <ReflectionSection title="Relationship with Partner" icon={<HeartIcon className="w-5 h-5 text-rose-500" />}>
                            <div className="flex flex-wrap gap-2">
                                {partnerRelationshipOptions.map(option => (
                                    <PillButton
                                        key={option}
                                        text={option}
                                        isSelected={partnerRelationship.includes(option)}
                                        onClick={() => toggleSelection(setPartnerRelationship, option)}
                                    />
                                ))}
                            </div>
                        </ReflectionSection>
                    </div>
                    
                    <hr className="border-slate-200/80" />

                    <ReflectionSection title="Prayer Requests" icon={<PrayingHandsIcon className="w-5 h-5" />}>
                        <textarea
                            value={prayerRequest}
                            onChange={(e) => setPrayerRequest(e.target.value)}
                            placeholder="What's on your heart? Share your needs..."
                            rows={3}
                            className="w-full bg-amber-50/40 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm transition"
                        ></textarea>
                    </ReflectionSection>

                    <ReflectionSection title="Gratitude & Intentions" icon={<SparkleIcon className="w-5 h-5" />}>
                         <textarea
                            value={gratitude}
                            onChange={(e) => setGratitude(e.target.value)}
                            placeholder="What's one small thing you're grateful for today?"
                            rows={2}
                            className="w-full bg-amber-50/40 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm transition mb-2"
                        ></textarea>
                         <textarea
                            value={intention}
                            onChange={(e) => setIntention(e.target.value)}
                            placeholder="How do you need your partner to show love to you today?"
                            rows={2}
                            className="w-full bg-amber-50/40 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm transition"
                        ></textarea>
                    </ReflectionSection>
                    
                    <ReflectionSection title="Add a Photo Memory" icon={<ImageIcon className="w-5 h-5" />}>
                        <ImageUploader
                            onUploadComplete={(url) => setImageUrl(url)}
                            folderName={`reflections/${user?.uid}`}
                            currentImageUrl={imageUrl}
                        />
                    </ReflectionSection>

                    <div className="flex justify-end pt-4 border-t border-slate-200">
                        <button
                            onClick={handleSave}
                            disabled={isFormEmpty}
                            className={`px-6 py-2 rounded-lg font-semibold text-white transition-all duration-300 w-40 ${
                                isSaved ? 'bg-green-500' : 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed'
                            }`}
                        >
                            {isSaved ? 'Saved!' : 'Save Reflection'}
                        </button>
                    </div>

                </div>
            </Card>
            {isVoiceModalOpen && (
                 <VoiceJournalModal
                    isOpen={isVoiceModalOpen}
                    onClose={() => setIsVoiceModalOpen(false)}
                    onComplete={handleVoiceJournalUpdate}
                    options={{
                        feelingOptions: allFeelingOptions,
                        godRelationshipOptions,
                        partnerRelationshipOptions,
                    }}
                />
            )}
        </>
    );
};
