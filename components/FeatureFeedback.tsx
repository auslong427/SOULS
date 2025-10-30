
import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { useAuth } from '../contexts/AuthContext';
import { FeatureFeedback as FeatureFeedbackType } from '../types';

export const FeatureFeedback: React.FC = () => {
    const { user, featureFeedback, addFeatureFeedback } = useAuth();
    const [feedbackText, setFeedbackText] = useState('');
    const [submittedIdeas, setSubmittedIdeas] = useState<FeatureFeedbackType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);
        const myIdeas = featureFeedback
            .filter(f => f.userId === user.uid)
            .sort((a, b) => b.createdAt - a.createdAt);
        setSubmittedIdeas(myIdeas);
        setIsLoading(false);
    }, [user, featureFeedback]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackText.trim() || !user) return;

        setIsSubmitting(true);
        addFeatureFeedback(feedbackText);
        setFeedbackText('');
        setIsSubmitting(false);
    };

    const getStatusChip = (status: 'new' | 'in-progress' | 'completed') => {
        switch (status) {
            case 'new':
                return <span className="text-xs font-medium bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">New</span>;
            case 'in-progress':
                return <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">In Progress</span>;
            case 'completed':
                return <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Completed</span>;
            default:
                return null;
        }
    };

    if (user?.displayName !== 'Angie') {
        return null;
    }

    return (
        <Card title="Angie's Feature Wishlist" icon={<LightbulbIcon className="w-6 h-6 text-amber-500" />}>
            <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="What new feature would make our app even better?"
                    rows={3}
                    className="w-full bg-amber-50/40 border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm transition"
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !feedbackText.trim()}
                        className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:bg-amber-300 transition-colors"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Idea'}
                    </button>
                </div>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-200">
                <h4 className="font-semibold text-indigo-900 mb-3">Submitted Ideas</h4>
                {isLoading ? (
                    <p className="text-stone-500 text-sm">Loading ideas...</p>
                ) : submittedIdeas.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {submittedIdeas.map(idea => (
                            <div key={idea.id} className="bg-stone-50 p-3 rounded-lg border border-stone-200 flex justify-between items-start">
                                <p className="text-sm text-indigo-950 pr-4">{idea.feedbackText}</p>
                                {getStatusChip(idea.status)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-stone-500 text-sm italic text-center py-4">No ideas submitted yet!</p>
                )}
            </div>
        </Card>
    );
};