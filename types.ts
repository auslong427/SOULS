export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AIAssistantTab {
  Chat = 'Chat',
  DeepReflection = 'Deep Reflection',
  LiveConversation = 'Live Conversation',
}

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface Task {
  id?: string;
  googleTaskId?: string;
  content: string;
  status: TaskStatus;
  ownerName: 'Austin' | 'Angie' | 'Shared';
  order: number;
  reminder?: number | null; // Stored as milliseconds
}

export interface Feeling {
    id?: string;
    label: string;
    emoji: string;
    source: 'predefined' | 'custom';
}

export interface EveningReflectionData {
    rating?: number;
    sawGod?: { options: string[], note?: string };
    apology?: { options: string[], note?: string };
    highlight?: string;
    missed?: { selectedTaskIds: string[], note?: string };
    inWord?: boolean;
    scripture?: { book?: string, passage?: string, note?: string };
    heartTakeaways?: { options: string[], note?: string };
}

export interface ReflectionSummary {
    sentiment?: string;
    keyTopics?: string[];
    scriptureRef?: string;
    stars?: number;
}


export interface Reflection {
  id?: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  feelings: (string[] | Feeling[]); // Support both old and new formats
  godRelationship: string[];
  partnerRelationship: string[];
  prayerRequest: string;
  gratitude: string;
  intention: string;
  loveNeed?: string;
  imageUrl?: string;
  createdAt: number; // Stored as milliseconds
  evening?: EveningReflectionData;
  summary?: ReflectionSummary;
}

export interface DinnerPlan {
    id?: string; // YYYY-MM-DD
    plan: string;
    cuisine: string;
    whosCooking: 'Austin' | 'Angie' | 'Both' | 'Eating Out';
    groceries: string[];
    location?: string;
    time?: string;
    notes?: string;
    createdBy: string;
    updatedAt: number; // Stored as milliseconds
    calendarEventId?: string;
}

export interface DinnerPreferences {
    id?: string; // userId
    cuisinesLiked: string[];
    cuisinesAvoid: string[];
    dietary: string[];
    notes: string;
}


export interface DinnerMemoryData {
    id?: string;
    date: string; // YYYY-MM-DD
    plan: string;
    groceries: string;
    austinCraving: string | null;
    angieCraving: string | null;
    austinCuisine: string | null;
    angieCuisine: string | null;
}

export interface EveningWindDownData {
    id?: string;
    userId: string;
    date: string; // YYYY-MM-DD
    thoughts: string;
}


export type User = 'Austin' | 'Angie' | 'Both';

export type Role = 'Austin' | 'Angie' | 'Shared';


export interface CalendarEvent {
  id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  color: string; // Tailwind bg color class
  ownerId: string;
  createdAt: number; // Stored as milliseconds
  type?: 'firestore' | 'google' | 'journal' | 'dinner' | 'task';
  data?: any; // To store original data for modals
}

export interface FeatureFeedback {
  id?:string;
  feedbackText: string;
  userName: string;
  userId: string;
  createdAt: number; // Stored as milliseconds
  status: 'new' | 'in-progress' | 'completed';
}