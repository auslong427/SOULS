import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Card } from './Card';
import { HeartIcon } from './icons/HeartIcon';

export const KindnessLoop: React.FC = () => {
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getKindWord = async () => {
    setIsLoading(true);
    setError('');
    setSuggestion('');
    try {
      if (!import.meta.env.VITE_API_KEY) {
        throw new Error("API key not found.");
      }
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: 'Generate one short, warm, and kind message for a romantic partner. Be genuine and loving.',
      });
      setSuggestion(response.text);
    } catch (e) {
      setError('Sorry, I couldn\'t think of anything right now. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Kindness Loop" icon={<HeartIcon className="w-6 h-6" />}>
      <p className="text-slate-600 mb-4">Send or speak one kind word to your partner.</p>
      <div className="text-center">
        <button
          onClick={getKindWord}
          disabled={isLoading}
          className="bg-rose-400 hover:bg-rose-500 text-white font-semibold rounded-lg px-6 py-2 transition-all duration-300 disabled:bg-rose-200"
        >
          {isLoading ? 'Inspiring...' : 'Suggest a kind word'}
        </button>
      </div>
      {suggestion && (
        <div className="mt-4 p-4 bg-rose-50 rounded-lg text-center italic text-rose-800">
          "{suggestion}"
        </div>
      )}
      {error && (
         <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center">
           {error}
         </div>
      )}
    </Card>
  );
};