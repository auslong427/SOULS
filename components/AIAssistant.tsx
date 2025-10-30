
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Chat, GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ChatMessage, AIAssistantTab } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { BotIcon } from './icons/BotIcon';
import { MicIcon } from './icons/MicIcon';
import { BrainIcon } from './icons/BrainIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { SendIcon } from './icons/SendIcon';
import { useAuth } from '../contexts/AuthContext';


const TabButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 p-2 w-full text-center rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-amber-100 text-amber-700' : 'text-indigo-700/80 hover:bg-amber-50'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// Audio helper functions from Gemini documentation
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


export const AIAssistant: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { chatHistory, saveChatHistory } = useAuth();
    const [activeTab, setActiveTab] = useState<AIAssistantTab>(AIAssistantTab.Chat);
    
    // Chat state
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [streamingResponse, setStreamingResponse] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Deep Reflection state
    const [reflectionInput, setReflectionInput] = useState('');
    const [reflectionOutput, setReflectionOutput] = useState('');
    const [isReflectionLoading, setIsReflectionLoading] = useState(false);

    // Live API State
    const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'stopped'>('idle');
    const [liveTranscription, setLiveTranscription] = useState<{user: string, model: string}[]>([]);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    const currentInputTranscriptionRef = useRef<string>('');
    const currentOutputTranscriptionRef = useRef<string>('');
    
    // Re-initialize GenAI Chat session when history changes
    useEffect(() => {
        if (import.meta.env.VITE_API_KEY) {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: chatHistory,
            });
            setChat(chatSession);
        }
    }, [chatHistory]);


    // Scroll chat to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, streamingResponse]);

    const handleChatSubmit = async () => {
        if (!chatInput.trim() || !chat || isChatLoading) return;
    
        const userMessage: ChatMessage = { role: 'user', text: chatInput };
        const newHistory = [...chatHistory, userMessage];
        saveChatHistory(newHistory);
        
        const currentInput = chatInput;
        setChatInput('');
        setIsChatLoading(true);
        setStreamingResponse('');
        
        try {
            const result = await chat.sendMessageStream({ message: currentInput });
            
            let modelResponseText = '';
            for await (const chunk of result) {
                modelResponseText += chunk.text;
                setStreamingResponse(modelResponseText); // Update streaming UI
            }
            const modelMessage: ChatMessage = { role: 'model', text: modelResponseText };
    
            // When streaming is done, save the complete model response.
            saveChatHistory([...newHistory, modelMessage]);
    
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, something went wrong.' };
            saveChatHistory([...newHistory, errorMessage]);
        } finally {
            setIsChatLoading(false);
            setStreamingResponse(null); // End streaming state
        }
    };

    const handleReflectionSubmit = async () => {
        if (!reflectionInput.trim() || isReflectionLoading) return;
        
        setIsReflectionLoading(true);
        setReflectionOutput('');
        try {
            if (!import.meta.env.VITE_API_KEY) throw new Error("API Key is missing");
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: reflectionInput,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            });
            setReflectionOutput(response.text ?? '');
        } catch (error) {
            console.error(error);
            setReflectionOutput("Sorry, I encountered an error during deep reflection.");
        } finally {
            setIsReflectionLoading(false);
        }
    };

    const startLiveConversation = useCallback(async () => {
        setLiveStatus('connecting');
        setLiveTranscription([]);
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';
        nextStartTimeRef.current = 0;
        audioSourcesRef.current.clear();
    
        try {
            if (!import.meta.env.VITE_API_KEY) throw new Error("API key missing");
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
    
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            inputAudioContextRef.current = inputAudioContext;
            
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputAudioContextRef.current = outputAudioContext;
    
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setLiveStatus('connected');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        audioProcessorRef.current = scriptProcessor;
    
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = { data: encode(new Uint8Array(inputData.buffer)), mimeType: 'audio/pcm;rate=16000' };
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
    
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            setLiveTranscription(prev => [...prev, { user: currentInputTranscriptionRef.current, model: currentOutputTranscriptionRef.current }]);
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }
    
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContextRef.current.destination);
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setLiveStatus('error');
                    },
                    onclose: () => {
                        if (liveStatus !== 'error') {
                            setLiveStatus('stopped');
                        }
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {}
                }
            });
    
            sessionPromiseRef.current = sessionPromise;
    
        } catch (error) {
            console.error('Failed to start live conversation', error);
            setLiveStatus('error');
        }
    }, [liveStatus]);

    const stopLiveConversation = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        audioProcessorRef.current?.disconnect();
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        setLiveStatus('stopped');
    }, []);

    useEffect(() => {
        return () => {
            if (liveStatus === 'connected' || liveStatus === 'connecting') {
                stopLiveConversation();
            }
        };
    }, [liveStatus, stopLiveConversation]);

    const renderContent = () => {
        switch (activeTab) {
            case AIAssistantTab.Chat:
                return (
                    <div className="flex flex-col h-full">
                        <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {streamingResponse && (
                                <div className="flex justify-start">
                                    <div className="max-w-xs px-4 py-2 rounded-2xl bg-slate-100 text-slate-800">
                                        <p className="text-sm whitespace-pre-wrap">{streamingResponse}</p>
                                    </div>
                                </div>
                            )}
                             {isChatLoading && !streamingResponse && (
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
                        <div className="p-4 border-t border-slate-200">
                            <form onSubmit={(e) => { e.preventDefault(); handleChatSubmit(); }} className="relative">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    className="w-full bg-slate-100 border-transparent rounded-lg pl-4 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    disabled={isChatLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isChatLoading || !chatInput.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-amber-500 rounded-full hover:bg-amber-100 disabled:text-slate-300"
                                    aria-label="Send chat message"
                                >
                                    <SendIcon className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                );
            case AIAssistantTab.DeepReflection:
                return (
                    <div className="p-4 space-y-4">
                        <h3 className="font-semibold text-indigo-900">Deep Reflection</h3>
                        <p className="text-sm text-slate-600">
                            Use this space for more complex thoughts or questions. The AI will take more time to provide a deeper, more thoughtful response.
                        </p>
                        <textarea
                            value={reflectionInput}
                            onChange={(e) => setReflectionInput(e.target.value)}
                            rows={5}
                            placeholder="What's on your mind?..."
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            disabled={isReflectionLoading}
                        />
                        <button
                            onClick={handleReflectionSubmit}
                            disabled={isReflectionLoading || !reflectionInput.trim()}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg disabled:bg-amber-300"
                        >
                            {isReflectionLoading ? 'Thinking...' : 'Start Reflection'}
                        </button>
                        {isReflectionLoading && (
                            <div className="text-center p-4">
                                <p className="text-sm text-slate-500">The AI is deeply reflecting on your query...</p>
                            </div>
                        )}
                        {reflectionOutput && !isReflectionLoading && (
                            <div className="p-4 bg-slate-50 rounded-lg border">
                                <p className="text-sm whitespace-pre-wrap">{reflectionOutput}</p>
                            </div>
                        )}
                    </div>
                );
            case AIAssistantTab.LiveConversation:
                return (
                    <div className="p-4 flex flex-col items-center justify-between h-full text-center">
                        <div className="flex-1 overflow-y-auto w-full mb-4 bg-slate-50 rounded-lg p-2 border">
                            {liveTranscription.length === 0 && (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    <p>Transcription will appear here.</p>
                                </div>
                            )}
                            {liveTranscription.map((turn, index) => (
                                <div key={index} className="mb-4 text-left p-2">
                                    <p className="text-sm"><span className="font-bold text-amber-700">You:</span> {turn.user}</p>
                                    <p className="text-sm"><span className="font-bold text-indigo-700">AI:</span> {turn.model}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex-shrink-0">
                            <button 
                                onClick={liveStatus === 'connected' ? stopLiveConversation : startLiveConversation}
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-colors
                                    ${liveStatus === 'connected' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                                    ${liveStatus === 'connecting' ? 'bg-slate-400 cursor-not-allowed' : ''}
                                `}
                                disabled={liveStatus === 'connecting'}
                            >
                                {liveStatus === 'connected' ? <PhoneIcon className="w-8 h-8"/> : <MicIcon className="w-8 h-8"/>}
                            </button>
                            <p className="text-sm text-slate-500 mt-4 h-5">
                                {liveStatus === 'idle' && 'Press to start conversation.'}
                                {liveStatus === 'connecting' && 'Connecting...'}
                                {liveStatus === 'connected' && 'Connected. Press to end.'}
                                {liveStatus === 'error' && 'An error occurred.'}
                                {liveStatus === 'stopped' && 'Conversation ended.'}
                            </p>
                        </div>
                    </div>
                );
        }
    }


    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[70vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <BotIcon className="w-6 h-6 text-amber-500" />
                        <h2 className="text-lg font-semibold text-indigo-900">AI Assistant</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close AI Assistant">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <nav className="flex justify-around p-2 border-b border-slate-200">
                    <TabButton
                        icon={<BotIcon className="w-5 h-5" />}
                        label="Chat"
                        isActive={activeTab === AIAssistantTab.Chat}
                        onClick={() => setActiveTab(AIAssistantTab.Chat)}
                    />
                    <TabButton
                        icon={<BrainIcon className="w-5 h-5" />}
                        label="Deep Reflection"
                        isActive={activeTab === AIAssistantTab.DeepReflection}
                        onClick={() => setActiveTab(AIAssistantTab.DeepReflection)}
                    />
                    <TabButton
                        icon={<PhoneIcon className="w-5 h-5" />}
                        label="Live Conversation"
                        isActive={activeTab === AIAssistantTab.LiveConversation}
                        onClick={() => setActiveTab(AIAssistantTab.LiveConversation)}
                    />
                </nav>
                <main className="flex-1 overflow-y-auto min-h-0">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};