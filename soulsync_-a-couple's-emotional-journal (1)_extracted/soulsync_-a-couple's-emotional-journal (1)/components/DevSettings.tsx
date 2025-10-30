import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { SendIcon } from './icons/SendIcon';
import { useAuth } from '../contexts/AuthContext';

type DevTab = 'Integrations' | 'Admin AI' | 'Data';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 border-b-2 ${
      isActive ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:bg-slate-100 hover:border-slate-300'
    }`}
  >
    {label}
  </button>
);

const fileSystemContext = `
You are an AI assistant for a developer working on the "SoulSync" React app.
Your task is to answer questions about the codebase, help debug issues, and suggest improvements.
Here is the file structure and a brief description of each file:

- **index.tsx**: Main entry point, renders <App />.
- **App.tsx**: Root component, manages page views, task state, and renders main layout.
- **types.ts**: Contains TypeScript type definitions.
- **contexts/AuthContext.tsx**: React context for managing mock user authentication, all application data via Local Storage, and Google Calendar API integration.
- **components/LoginPage.tsx**: A simple login page to select a user profile ('Austin' or 'Angie').
- **components/Calendar.tsx**: Shared calendar that merges local events with Google Calendar events.
`;

export const DevSettings: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<DevTab>('Integrations');
    const {
        availableCalendars,
        calendarId,
        selectCalendar,
        isGoogleCalendarConnected,
        isGoogleSyncing,
        refreshCalendarList,
        refreshCalendarNow,
    } = useAuth();

    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);

    const handleAdminAISubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setHistory(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (!import.meta.env.VITE_API_KEY) throw new Error("API key not found.");
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
            const fullPrompt = `${fileSystemContext}\n\nUser question: ${input}`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: fullPrompt,
            });

            const modelMessage: ChatMessage = { role: 'model', text: response.text ?? 'No response generated.' };
            setHistory(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, an error occurred. Please check the console.' };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClearLocalStorage = () => {
        if (window.confirm('Are you sure you want to clear all local application data? This will reset reflections and cannot be undone.')) {
            localStorage.clear();
            alert('Local storage cleared. The application will now reload.');
            window.location.reload();
        }
    };

    useEffect(() => {
        if (isOpen && isGoogleCalendarConnected) {
            refreshCalendarList();
        }
    }, [isOpen, isGoogleCalendarConnected, refreshCalendarList]);

    const handleCalendarChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        selectCalendar(event.target.value);
        refreshCalendarNow();
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Integrations':
                return (
                    <div className="p-6 space-y-6 text-slate-700">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Google Calendar Integration</h3>
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 space-y-3">
                                <p className="font-semibold">Google Calendar is {isGoogleCalendarConnected ? 'connected' : 'not connected'}.</p>
                                <p>Select which calendar you want to sync with the shared agenda.</p>
                                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                    <label htmlFor="dev-settings-calendar-select" className="text-xs uppercase tracking-wide text-green-700 font-semibold">Calendar</label>
                                    <select
                                        id="dev-settings-calendar-select"
                                        className="w-full md:w-auto border border-green-200 rounded-md px-3 py-2 text-sm text-green-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                                        value={calendarId || ''}
                                        onChange={handleCalendarChange}
                                        disabled={!isGoogleCalendarConnected || isGoogleSyncing || availableCalendars.length === 0}
                                    >
                                        {availableCalendars.length === 0 && <option value="">{isGoogleCalendarConnected ? 'Loading calendars…' : 'Connect Google Calendar first'}</option>}
                                        {availableCalendars.map(cal => (
                                            <option key={cal.id} value={cal.id}>
                                                {cal.summary} {cal.primary ? '(Primary)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <button
                                        onClick={() => refreshCalendarList()}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white/80 hover:bg-white text-green-700 border border-green-200"
                                        disabled={isGoogleSyncing}
                                    >
                                        Refresh Calendars
                                    </button>
                                    <button
                                        onClick={() => refreshCalendarNow()}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-green-200 hover:bg-green-300 text-green-900"
                                        disabled={isGoogleSyncing}
                                    >
                                        Sync Events
                                    </button>
                                    {isGoogleSyncing && <span className="text-xs text-green-700">Syncing…</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Admin AI':
                return (
                     <div className="flex flex-col h-full">
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="flex justify-start">
                                <div className="max-w-lg px-4 py-2 rounded-2xl bg-slate-200 text-slate-800">
                                    <p className="whitespace-pre-wrap text-sm">I have context of the app's file structure. Ask me anything about the code, debugging, or how to implement a new feature.</p>
                                </div>
                            </div>
                            {history.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                                        <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.text.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-slate-800 text-white p-3 rounded-md my-2 text-sm overflow-x-auto"><code>$2</code></pre>') }}></p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="px-4 py-2 rounded-2xl bg-slate-200 text-slate-800">
                                        <div className="flex items-center space-x-2">
                                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-200 flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleAdminAISubmit()}
                                placeholder="e.g., How does the Kanban board state update?"
                                className="flex-1 bg-slate-100 border-transparent rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                            <button onClick={handleAdminAISubmit} disabled={isLoading || !input.trim()} className="ml-3 p-2 text-sky-500 rounded-full hover:bg-sky-100 disabled:text-slate-300" aria-label="Send admin AI message">
                                <SendIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                );
            case 'Data':
                 return (
                    <div className="p-6 space-y-4 text-slate-700">
                        <h3 className="text-lg font-semibold">Data Management</h3>
                        <p className="text-sm">This section contains tools for managing local application data during development.</p>
                        <div>
                            <button 
                                onClick={handleClearLocalStorage}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-all duration-300"
                            >
                                Clear Local Storage
                            </button>
                            <p className="text-xs text-slate-500 mt-2">This will remove all saved reflections and other data stored in your browser for this app.</p>
                        </div>
                    </div>
                 );
        }
    };

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[800px] flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-700">Developer Settings</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close developer settings">
                <CloseIcon className="w-6 h-6" />
            </button>
        </header>

        <nav className="flex px-4 border-b border-slate-200 bg-slate-50/50">
            <TabButton label="Integrations" isActive={activeTab === 'Integrations'} onClick={() => setActiveTab('Integrations')} />
            <TabButton label="Admin AI" isActive={activeTab === 'Admin AI'} onClick={() => setActiveTab('Admin AI')} />
            <TabButton label="Data" isActive={activeTab === 'Data'} onClick={() => setActiveTab('Data')} />
        </nav>
        
        <main className="flex-1 overflow-y-auto min-h-0">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};