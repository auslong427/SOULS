
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { CloseIcon } from './icons/CloseIcon';
import { MicIcon } from './icons/MicIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface VoiceJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  options: {
    feelingOptions: string[];
    godRelationshipOptions: string[];
    partnerRelationshipOptions: string[];
  };
}

type Status = 'idle' | 'recording' | 'processing' | 'error';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const VoiceJournalModal: React.FC<VoiceJournalModalProps> = ({ isOpen, onClose, onComplete, options }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setStatus('error');
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setFinalTranscript(prev => prev + final);
      setTranscript(interimTranscript);
    };
    
    recognition.onend = () => {
        if (status === 'recording') {
            setStatus('processing');
        }
    };

    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setStatus('error');
    };

    recognitionRef.current = recognition;
  }, [status]);

  useEffect(() => {
    if (status === 'processing') {
      processTranscript(finalTranscript);
    }
  }, [status, finalTranscript]);

  const handleMicClick = () => {
    if (status === 'recording') {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setFinalTranscript('');
      setError('');
      setStatus('recording');
      recognitionRef.current?.start();
    }
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) {
      setError('No speech detected. Please try again.');
      setStatus('idle');
      return;
    }
    
    try {
        if (!import.meta.env.VITE_API_KEY) throw new Error("API Key is missing");
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

        const schema = {
            type: Type.OBJECT,
            properties: {
                feelings: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of feelings expressed by the user.' },
                godRelationship: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of feelings expressed by the user about their relationship with God.' },
                partnerRelationship: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of feelings expressed by the user about their relationship with their partner.' },
                prayerRequest: { type: Type.STRING, description: 'The user\'s prayer requests.' },
                gratitude: { type: Type.STRING, description: 'What the user is grateful for.' },
                intention: { type: Type.STRING, description: 'The user\'s intention for the day.' }
            }
        };

        const prompt = `You are an expert at understanding and parsing journal entries. Analyze the following text from a user's spoken journal entry. Your goal is to extract specific pieces of information and structure them into a JSON object.

        Here are the categories and the possible options for some of them. Be precise.
        - feelings: An array of strings. Choose one or more from this list that best match the user's sentiment. The strings in the list contain emojis; return the full, exact string from the list including the emoji. Options: ${options.feelingOptions.join(', ')}.
        - godRelationship: An array of strings. Choose one or more from this list that best match the user's sentiment. Options: ${options.godRelationshipOptions.join(', ')}. If the user doesn't mention it, return an empty array.
        - partnerRelationship: An array of strings. Choose one or more from this list that best match the user's sentiment. Options: ${options.partnerRelationshipOptions.join(', ')}. If the user doesn't mention it, return an empty array.
        - prayerRequest: A string containing the user's prayer requests. If none, return an empty string.
        - gratitude: A string containing what the user is grateful for. If none, return an empty string.
        - intention: A string containing the user's intention for the day, especially regarding their partner. If none, return an empty string.

        Journal Entry Text:
        "${text}"

        Please provide your answer strictly in the JSON format defined by the schema. Do not add any extra commentary.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });

  const jsonStr = (response.text ?? '').trim();
        const jsonData = JSON.parse(jsonStr);
        onComplete(jsonData);
    } catch (err) {
        console.error(err);
        setError('Could not process your journal entry. The AI might be having trouble. Please try again.');
        setStatus('error');
    }
  };

  const MicButton = () => {
      let icon = <MicIcon className="w-10 h-10" />;
      let color = 'bg-sky-500 hover:bg-sky-600';
      if (status === 'recording') {
          icon = <div className="w-5 h-5 bg-white rounded-sm"></div>;
          color = 'bg-red-500 hover:bg-red-600 animate-pulse';
      }
      if (status === 'processing') {
          icon = <SpinnerIcon className="w-10 h-10" />;
          color = 'bg-slate-400';
      }
      return (
        <button
            onClick={handleMicClick}
            disabled={status === 'processing'}
            className={`w-24 h-24 rounded-full text-white flex items-center justify-center transition-all duration-300 shadow-lg ${color}`}
        >
            {icon}
        </button>
      );
  }

  const StatusText = () => {
      let text = "Speak your morning reflection freely. Press the mic to start.";
      if (status === 'recording') text = "Recording... Press the button to stop.";
      if (status === 'processing') text = "Thinking... Analyzing your reflection.";
      if (status === 'error') text = "Something went wrong.";
      return <p className="text-slate-500 text-center h-10">{text}</p>
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-700">Voice Journal</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close voice journal">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center space-y-6">
            <StatusText />
            <MicButton />
            <div className="w-full h-24 bg-slate-50 rounded-lg p-3 text-sm text-slate-700 overflow-y-auto border">
                <span className="text-slate-900">{finalTranscript}</span>
                <span className="text-slate-500">{transcript}</span>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
};