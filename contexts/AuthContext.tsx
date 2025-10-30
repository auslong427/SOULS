import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Task, Reflection, CalendarEvent, DinnerPlan, FeatureFeedback, ChatMessage, DinnerPreferences } from '../types';
import { app, db } from '../firebaseConfig';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    setDoc,
    getDoc,
    collectionGroup,
  } from 'firebase/firestore';
import { signInWithRedirect } from 'firebase/auth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CALENDAR_SCOPES = 'https://www.googleapis.com/auth/calendar';
const GOOGLE_TASKS_SCOPES = 'https://www.googleapis.com/auth/tasks';

const ENV_DEFAULT_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;
const CALENDAR_STORAGE_KEY = 'soulsync.selectedCalendarId';

const auth = getAuth(app);

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const DEFAULT_EVENT_COLOR = 'bg-blue-400';
const TAILWIND_TO_GOOGLE_COLOR_ID: Record<string, string> = {
  'bg-rose-400': '11',
  'bg-indigo-400': '9',
  'bg-amber-400': '5',
  'bg-green-400': '2',
  'bg-blue-400': '1',
};

const GOOGLE_COLOR_ID_TO_TAILWIND: Record<string, string> = {
  '11': 'bg-rose-400',
  '9': 'bg-indigo-400',
  '5': 'bg-amber-400',
  '2': 'bg-green-400',
  '1': 'bg-blue-400',
};

const getColorClassFromGoogleEvent = (item: any): string => {
  const extendedColor = item?.extendedProperties?.private?.colorClass;
  if (typeof extendedColor === 'string' && extendedColor.trim().length > 0) {
    return extendedColor;
  }
  if (item?.colorId && GOOGLE_COLOR_ID_TO_TAILWIND[item.colorId]) {
    return GOOGLE_COLOR_ID_TO_TAILWIND[item.colorId];
  }
  return DEFAULT_EVENT_COLOR;
};

const getGoogleColorId = (colorClass?: string): string | undefined => {
  if (!colorClass) return undefined;
  return TAILWIND_TO_GOOGLE_COLOR_ID[colorClass] || undefined;
};

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface GoogleCalendarSummary {
  id: string;
  summary: string;
  primary: boolean;
  accessRole: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: () => void;
  logOut: () => void;
  tasks: Task[];
  addTask: (content: string, ownerName: 'Austin' | 'Angie' | 'Shared') => void;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
  reorderTask: (draggedId: string, targetId: string) => void;
  setTaskReminder: (taskId: string, reminderDate: Date | null) => void;
  reflections: Reflection[];
  getReflection: (docId: string) => Reflection | undefined;
  saveReflection: (reflection: Reflection) => void;
  events: CalendarEvent[];
  addEvent: (title: string, color: string, date: string, time?: string) => void;
  updateEvent: (eventId: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => void;
  deleteEvent: (eventId: string) => void;
  dinnerPlans: DinnerPlan[];
  saveDinnerPlan: (plan: Omit<DinnerPlan, 'updatedAt'>) => void;
  featureFeedback: FeatureFeedback[];
  addFeatureFeedback: (feedbackText: string) => void;
  chatHistory: ChatMessage[];
  saveChatHistory: (messages: ChatMessage[]) => void;
  getDinnerPreferences: (userId: string) => DinnerPreferences | undefined;
  saveDinnerPreferences: (userId: string, prefs: Omit<DinnerPreferences, 'id'>) => void;
  isGoogleCalendarConnected: boolean;
  isGoogleSyncing: boolean;
  calendarId: string | null;
  availableCalendars: GoogleCalendarSummary[];
  selectCalendar: (calendarId: string) => void;
  refreshCalendarList: () => Promise<void>;
  disconnectGoogleCalendar: () => void;
  syncGoogleCalendarEvents: () => Promise<void>;
  lastCalendarSyncAt: number | null;
  refreshCalendarNow: () => Promise<void>;
  updateDinnerPlanOnCalendar: (plan: DinnerPlan, sync: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [dinnerPlans, setDinnerPlans] = useState<DinnerPlan[]>([]);
  const [featureFeedback, setFeatureFeedback] = useState<FeatureFeedback[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [dinnerPreferences, setDinnerPreferences] = useState<DinnerPreferences[]>([]);

  // Google Calendar State
  const [gapiClient, setGapiClient] = useState<any>(null);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  const [pendingGoogleAccessToken, setPendingGoogleAccessToken] = useState<string | null>(null);
  const [gsiLoading, setGsiLoading] = useState<boolean>(false);
  const [lastCalendarSyncAt, setLastCalendarSyncAt] = useState<number | null>(null);
  const resolveInitialCalendarId = () => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(CALENDAR_STORAGE_KEY);
      if (stored) return stored;
    }
    if (ENV_DEFAULT_CALENDAR_ID && ENV_DEFAULT_CALENDAR_ID.trim().length > 0) {
      return ENV_DEFAULT_CALENDAR_ID.trim();
    }
    return 'primary';
  };
  const [calendarId, setCalendarIdState] = useState<string | null>(() => resolveInitialCalendarId());
  const [availableCalendars, setAvailableCalendars] = useState<GoogleCalendarSummary[]>([]);

  const selectCalendar = useCallback((id: string) => {
    setCalendarIdState(id);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && calendarId) {
      window.localStorage.setItem(CALENDAR_STORAGE_KEY, calendarId);
    }
  }, [calendarId]);

  const ensureGsiLoaded = useCallback(async () => {
    if (window.google?.accounts?.oauth2) return;
    if (gsiLoading) {
      // wait briefly for existing load
      await new Promise(r => setTimeout(r, 300));
      if (window.google?.accounts?.oauth2) return;
    }
    setGsiLoading(true);
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.body.appendChild(script);
    }).catch((e) => console.error(e))
      .finally(() => setGsiLoading(false));
  }, [gsiLoading]);

  // Load GAPI client
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client', () => {
        if (!GOOGLE_CLIENT_ID) {
          console.error('VITE_GOOGLE_CLIENT_ID is not set. Google APIs will not be initialized.');
        }
        window.gapi.client.init({
          clientId: GOOGLE_CLIENT_ID,
          scope: `${GOOGLE_CALENDAR_SCOPES} ${GOOGLE_TASKS_SCOPES}`,
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
            'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'
        ],
        }).then(() => {
          setGapiClient(window.gapi);
          // If a token already exists (from a prior session), mark connected and sync
          try {
            const existing = window.gapi.client.getToken ? window.gapi.client.getToken() : null;
            if (existing?.access_token) {
              setIsGoogleCalendarConnected(true);
              refreshCalendarList();
              syncGoogleCalendarEvents();
            }
          } catch {}
          // If user logged in before gapi loaded, apply pending token now
          if (pendingGoogleAccessToken) {
            try {
              window.gapi.client.setToken({ access_token: pendingGoogleAccessToken });
              setIsGoogleCalendarConnected(true);
              refreshCalendarList();
              syncGoogleCalendarEvents();
            } catch (e) {
              console.error('Failed to set pending Google token', e);
            } finally {
              setPendingGoogleAccessToken(null);
            }
          }
        });
      });
    };
    document.body.appendChild(script);
  }, [pendingGoogleAccessToken]);

  const refreshCalendarList = useCallback(async () => {
    if (!gapiClient) return;
    try {
      const response = await gapiClient.client.calendar.calendarList.list();
      const calendars: GoogleCalendarSummary[] = (response.result.items || []).map((item: any) => ({
        id: item.id,
        summary: item.summary || item.id,
        primary: Boolean(item.primary),
        accessRole: item.accessRole || 'reader',
      }));

      setAvailableCalendars(calendars);

      if (!calendars.length) {
        setIsGoogleCalendarConnected(false);
        return;
      }

      setIsGoogleCalendarConnected(true);

      const hasSelected = calendarId ? calendars.some(cal => cal.id === calendarId) : false;
      if (!hasSelected) {
        const preferredFromEnv = ENV_DEFAULT_CALENDAR_ID && calendars.find(cal => cal.id === ENV_DEFAULT_CALENDAR_ID.trim());
        const fallback = preferredFromEnv || calendars.find(cal => cal.primary) || calendars[0];
        if (fallback) {
          selectCalendar(fallback.id);
        }
      }
    } catch (e) {
      console.error('Failed to load calendar list', e);
      setIsGoogleCalendarConnected(false);
    }
  }, [gapiClient, calendarId, selectCalendar]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const { uid, displayName, email, photoURL } = firebaseUser;
        setUser({ uid, displayName, email, photoURL });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
        setTasks([]);
        setReflections([]);
        setEvents([]);
        setDinnerPlans([]);
        setFeatureFeedback([]);
        setChatHistory([]);
        setDinnerPreferences([]);
        return;
    }

    const collections = {
        tasks: query(collection(db, 'users', user.uid, 'tasks'), orderBy('order')),
        // Note: reflections now attempt a global view via collectionGroup for "anyone can see" behavior.
        // We still define the user path for fallback if rules block collectionGroup.
        reflectionsUserScoped: query(collection(db, 'users', user.uid, 'reflections'), orderBy('date')),
        dinnerPlans: collection(db, 'users', user.uid, 'dinnerPlans'),
        featureFeedback: query(collection(db, 'users', user.uid, 'featureFeedback'), orderBy('createdAt', 'desc')),
        chatHistory: doc(db, 'users', user.uid, 'chat', 'history'),
        dinnerPreferences: collection(db, 'users', user.uid, 'dinnerPreferences'),
    };

    const unsubscribes: Array<() => void> = [
        onSnapshot(collections.tasks, snapshot => setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)))),
        // reflections subscription is set up below using collectionGroup with a fallback
        onSnapshot(collections.dinnerPlans, snapshot => setDinnerPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DinnerPlan)))),
        onSnapshot(collections.featureFeedback, snapshot => setFeatureFeedback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeatureFeedback)))),
        onSnapshot(collections.dinnerPreferences, snapshot => setDinnerPreferences(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DinnerPreferences)))),
        onSnapshot(collections.chatHistory, snapshot => setChatHistory((snapshot.data()?.messages || []) as ChatMessage[])),
    ];

    // Set up reflections via collectionGroup to show all users' reflections
    const toMs = (d: string) => new Date((d || '').replace(/-/g, '/')).getTime();
    const globalReflectionsQuery = collectionGroup(db, 'reflections');
    let reflectionsUnsub: (() => void) | null = null;
    let fallbackUnsub: (() => void) | null = null;

    reflectionsUnsub = onSnapshot(
      globalReflectionsQuery,
      (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reflection));
        // Sort by date desc, fallback to createdAt if date missing
        list.sort((a, b) => {
          const am = a.date ? toMs(a.date) : (a.createdAt || 0);
          const bm = b.date ? toMs(b.date) : (b.createdAt || 0);
          return bm - am;
        });
        setReflections(list);
      },
      (error) => {
        console.warn('collectionGroup(reflections) failed, falling back to user-scoped reflections:', error);
        // Fallback: user-scoped reflections
        if (!fallbackUnsub) {
          fallbackUnsub = onSnapshot(collections.reflectionsUserScoped, snapshot => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reflection));
            list.sort((a, b) => {
              const am = a.date ? toMs(a.date) : (a.createdAt || 0);
              const bm = b.date ? toMs(b.date) : (b.createdAt || 0);
              return bm - am;
            });
            setReflections(list);
          });
        }
      }
    );

    if (reflectionsUnsub) unsubscribes.push(() => reflectionsUnsub && reflectionsUnsub());
    if (fallbackUnsub) unsubscribes.push(() => fallbackUnsub && fallbackUnsub());

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user]);

  const logIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
  provider.addScope(GOOGLE_CALENDAR_SCOPES);
  provider.addScope(GOOGLE_TASKS_SCOPES);
  // Force consent so incremental scopes are granted even if already signed in
  provider.setCustomParameters({ prompt: 'consent select_account', include_granted_scopes: 'true' as any });
    try {
      const result = auth.currentUser
        ? await reauthenticateWithPopup(auth.currentUser, provider)
        : await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        if (gapiClient) {
          gapiClient.client.setToken({ access_token: credential.accessToken });
          setIsGoogleCalendarConnected(true);
          await refreshCalendarList();
          syncGoogleCalendarEvents();
        }
        else {
          // gapi client not ready yet; store token to apply when gapi loads
          setPendingGoogleAccessToken(credential.accessToken);
        }
      } else {
        // Fallback: request an access token using Google Identity Services
        try {
          await ensureGsiLoaded();
          if (!GOOGLE_CLIENT_ID) {
            // Surface a clear message if the Google OAuth Client ID is not configured
            alert('Google OAuth Client ID (VITE_GOOGLE_CLIENT_ID) is not set. Calendar connection cannot proceed.');
            setLoading(false);
            return;
          }
          if (!window.google?.accounts?.oauth2) throw new Error('Google Identity Services unavailable');
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: `${GOOGLE_CALENDAR_SCOPES} ${GOOGLE_TASKS_SCOPES}`,
            prompt: 'consent',
            callback: async (resp: any) => {
              if (resp?.access_token) {
                if (gapiClient) {
                  gapiClient.client.setToken({ access_token: resp.access_token });
                  setIsGoogleCalendarConnected(true);
                  await refreshCalendarList();
                  syncGoogleCalendarEvents();
                } else {
                  setPendingGoogleAccessToken(resp.access_token);
                }
              } else {
                alert('Could not obtain Google access token. Check popup/cookie settings and try again.');
              }
            }
          });
          tokenClient.requestAccessToken();
        } catch (e) {
          console.error('GIS token fallback failed', e);
          alert('Google sign-in did not return an access token. Please enable popups and third-party cookies for localhost, or remove the app from https://myaccount.google.com/permissions and try again.');
        }
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      const message = (error as any)?.message || 'Unknown error';
      const code = (error as any)?.code || '';
      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (e) {
          console.error('Redirect sign-in failed', e);
        }
      }
      alert(`Google sign-in failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    await signOut(auth);
    if (gapiClient) {
      gapiClient.client.setToken(null);
    }
    setIsGoogleCalendarConnected(false);
    setEvents([]);
    setLastCalendarSyncAt(null);
  };

  const syncGoogleCalendarEvents = useCallback(async () => {
    if (!gapiClient || !isGoogleCalendarConnected || !calendarId) return;
    setIsGoogleSyncing(true);
    try {
      const now = Date.now();
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      const response = await gapiClient.client.calendar.events.list({
        calendarId,
        timeMin: new Date(now - oneYear).toISOString(),
        timeMax: new Date(now + oneYear).toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 250,
        orderBy: 'startTime',
      });

      const googleEvents = (response.result.items || [])
        .map((item: any) => {
          const hasDateTime = Boolean(item.start?.dateTime);
          let time: string | undefined;
          if (hasDateTime) {
            const d = new Date(item.start.dateTime);
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            time = `${hh}:${mm}`;
          }

          const dateValue = item.start?.date
            || (item.start?.dateTime ? new Date(item.start.dateTime).toISOString().split('T')[0] : '');

          const dataWithCal = { ...item, __calendarId: calendarId };

          return {
            id: item.id,
            title: item.summary,
            date: dateValue,
            time,
            color: getColorClassFromGoogleEvent(item),
            ownerId: 'google',
            createdAt: item.created ? new Date(item.created).getTime() : Date.now(),
            type: 'google',
            data: dataWithCal,
          } as CalendarEvent;
        })
        .sort((a: CalendarEvent, b: CalendarEvent) => {
          const toMs = (event: CalendarEvent) => new Date(event.date.replace(/-/g, '/')).getTime();
          const delta = toMs(a) - toMs(b);
          if (delta !== 0) return delta;
          if (a.time && b.time) return a.time.localeCompare(b.time);
          if (a.time) return -1;
          if (b.time) return 1;
          return a.title.localeCompare(b.title);
        });

      setEvents(googleEvents);
      setLastCalendarSyncAt(Date.now());
    } catch (error) {
      console.error('Error syncing Google Calendar events:', error);
      const code = (error && typeof error === 'object' && 'result' in (error as any)) ? (error as any).result?.error?.code : undefined;
      if (code === 401) {
        setIsGoogleCalendarConnected(false);
      }
    } finally {
      setIsGoogleSyncing(false);
    }
  }, [gapiClient, isGoogleCalendarConnected, calendarId]);

  const refreshCalendarNow = useCallback(async () => {
    await refreshCalendarList();
    await syncGoogleCalendarEvents();
  }, [refreshCalendarList, syncGoogleCalendarEvents]);

  // Re-sync when user changes selected calendar
  useEffect(() => {
    if (isGoogleCalendarConnected && gapiClient) {
      syncGoogleCalendarEvents();
    }
  }, [isGoogleCalendarConnected, gapiClient, syncGoogleCalendarEvents]);

  const addTask = async (content: string, ownerName: 'Austin' | 'Angie' | 'Shared') => {
    if (!user || !gapiClient || !isGoogleCalendarConnected) return;

    const task = { title: content };

    const request = gapiClient.client.tasks.tasks.insert({
      tasklist: '@default',
      resource: task,
    });

    request.execute(async (googleTask: any) => {
      if (googleTask.error) {
        console.error('Error adding Google Task:', googleTask.error);
        // Popup confirmation for error
        alert('Failed to create Google Task. Please try again.');
        return;
      }
      const docRef = await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        content,
        ownerName,
        status: 'todo',
        order: Date.now(),
        createdAt: serverTimestamp(),
        googleTaskId: googleTask.id,
      });
      await updateDoc(docRef, { id: docRef.id });
      // Popup confirmation for success
      alert('Task created in Google Tasks');
    });
  };

  const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    await updateDoc(taskRef, updates);

    if (gapiClient && isGoogleCalendarConnected) {
        const taskDoc = await getDoc(taskRef);
        const taskData = taskDoc.data();

        if (taskData && taskData.googleTaskId) {
            const request = gapiClient.client.tasks.tasks.patch({
                tasklist: '@default',
                task: taskData.googleTaskId, // Corrected from taskId
                resource: { title: updates.content, status: updates.status === 'done' ? 'completed' : 'needsAction' },
            });
            request.execute((result: any) => {
                if (result.error) {
                    console.error('Error updating Google Task:', result.error);
                }
            });
        }
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    
    if (gapiClient && isGoogleCalendarConnected) {
        const taskDoc = await getDoc(taskRef);
        const taskData = taskDoc.data();

        if (taskData && taskData.googleTaskId) {
            const request = gapiClient.client.tasks.tasks.delete({
                tasklist: '@default',
                task: taskData.googleTaskId,
            });
            request.execute((result: any) => {
                if (result.error) {
                    console.error('Error deleting Google Task:', result.error);
                }
            });
        }
    }
    await deleteDoc(taskRef);
  };

  const reorderTask = async (draggedId: string, targetId: string) => {
    if (!user) return;
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const draggedTaskDoc = await getDoc(doc(tasksRef, draggedId));
    const targetTaskDoc = await getDoc(doc(tasksRef, targetId));

    if (!draggedTaskDoc.exists() || !targetTaskDoc.exists()) return;

    const draggedOrder = draggedTaskDoc.data().order;
    const targetOrder = targetTaskDoc.data().order;

    await updateDoc(doc(tasksRef, draggedId), { order: targetOrder });
    await updateDoc(doc(tasksRef, targetId), { order: draggedOrder });
  };

  const setTaskReminder = (taskId: string, reminderDate: Date | null) => {
    updateTask(taskId, { reminder: reminderDate ? reminderDate.getTime() : null });
  };

  const getReflection = (docId: string) => reflections.find(r => r.id === docId);

  const saveReflection = async (reflection: Reflection) => {
    if (!user) return;
    const { id, ...reflectionData } = reflection;
    if (id) {
      await setDoc(doc(db, 'users', user.uid, 'reflections', id), { ...reflectionData, updatedAt: serverTimestamp() }, { merge: true });
    } else {
      await addDoc(collection(db, 'users', user.uid, 'reflections'), { ...reflectionData, createdAt: serverTimestamp() });
    }
  };

  const addEvent = async (title: string, color: string, date: string, time?: string) => {
    if (!user || !gapiClient || !isGoogleCalendarConnected || !calendarId) return;

    const resource: any = {
      summary: title,
      extendedProperties: { private: { colorClass: color } },
    };

    const colorId = getGoogleColorId(color);
    if (colorId) {
      resource.colorId = colorId;
    }

    if (time) {
      const startDateTime = new Date(`${date}T${time}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
      resource.start = { dateTime: startDateTime.toISOString() };
      resource.end = { dateTime: endDateTime.toISOString() };
    } else {
      const endDate = new Date(date.replace(/-/g, '/'));
      endDate.setDate(endDate.getDate() + 1);
      resource.start = { date };
      resource.end = { date: endDate.toISOString().split('T')[0] };
    }

    const request = gapiClient.client.calendar.events.insert({
      calendarId,
      resource,
    });

    request.execute((result: any) => {
      if (result?.error) {
        console.error('Error creating Google Calendar event:', result.error);
        alert('Failed to create Google Calendar event. Please try again.');
        return;
      }
      syncGoogleCalendarEvents();
      alert('Event created in Google Calendar');
    });
  };

  const updateEvent = async (eventId: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => {
    if (!gapiClient || !isGoogleCalendarConnected || !calendarId) return;

    try {
      const current = await gapiClient.client.calendar.events.get({ calendarId, eventId });
      const resource: any = {};

      if (updates.title) {
        resource.summary = updates.title;
      }

      const nextColor = updates.color ?? current.result?.extendedProperties?.private?.colorClass;
      if (nextColor) {
        resource.extendedProperties = { private: { colorClass: nextColor } };
        const colorId = getGoogleColorId(nextColor);
        if (colorId) {
          resource.colorId = colorId;
        }
      }

      const wantsDateChange = Object.prototype.hasOwnProperty.call(updates, 'date');
      const wantsTimeChange = Object.prototype.hasOwnProperty.call(updates, 'time');

      if (wantsDateChange || wantsTimeChange) {
        const start = current.result?.start;
        let effectiveDate = wantsDateChange ? updates.date : undefined;
        if (!effectiveDate) {
          if (start?.date) {
            effectiveDate = start.date;
          } else if (start?.dateTime) {
            effectiveDate = new Date(start.dateTime).toISOString().split('T')[0];
          }
        }

        let effectiveTime = wantsTimeChange ? updates.time : undefined;
        if (typeof effectiveTime === 'undefined' && start?.dateTime) {
          const dt = new Date(start.dateTime);
          effectiveTime = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
        }

        if (effectiveTime) {
          const startDateTime = new Date(`${effectiveDate}T${effectiveTime}`);
          const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
          resource.start = { dateTime: startDateTime.toISOString() };
          resource.end = { dateTime: endDateTime.toISOString() };
        } else if (effectiveDate) {
          const endDate = new Date(effectiveDate.replace(/-/g, '/'));
          endDate.setDate(endDate.getDate() + 1);
          resource.start = { date: effectiveDate };
          resource.end = { date: endDate.toISOString().split('T')[0] };
        }
      }

      const request = gapiClient.client.calendar.events.patch({
        calendarId,
        eventId,
        resource,
      });

      request.execute((result: any) => {
        if (result?.error) {
          console.error('Error updating Google Calendar event:', result.error);
          alert('Failed to update Google Calendar event.');
          return;
        }
        syncGoogleCalendarEvents();
      });
    } catch (error) {
      console.error('Error fetching Google Calendar event before update:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!gapiClient || !isGoogleCalendarConnected || !calendarId) return;

    const request = gapiClient.client.calendar.events.delete({
      calendarId,
      eventId,
    });

    request.execute((result: any) => {
      if (result?.error) {
        console.error('Error deleting Google Calendar event:', result.error);
        alert('Failed to delete Google Calendar event.');
        return;
      }
      syncGoogleCalendarEvents();
    });
  };

  const saveDinnerPlan = async (plan: Omit<DinnerPlan, 'updatedAt'>) => {
    if (!user) return;
    // Ensure we always have a valid string id for the document
    const planId = plan.id ?? Math.random().toString(36).slice(2);
    await setDoc(
      doc(db, 'users', user.uid, 'dinnerPlans', planId),
      { ...plan, id: planId, updatedAt: serverTimestamp() }
    );
  };
  
  const updateDinnerPlanOnCalendar = async (plan: DinnerPlan, sync: boolean) => {
    if (!isGoogleCalendarConnected || !gapiClient || !user) return;
    // ... (rest of the logic is complex, requires careful implementation with firestore)
    console.warn("updateDinnerPlanOnCalendar is not fully implemented yet");
  };

  const addFeatureFeedback = async (feedbackText: string) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'featureFeedback'), {
      feedbackText, userId: user.uid, userName: user.displayName || '', createdAt: serverTimestamp(), status: 'new',
    });
  };

  const saveChatHistory = async (messages: ChatMessage[]) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'chat', 'history'), { messages });
  };

  const getDinnerPreferences = (userId: string) => dinnerPreferences.find(p => p.id === userId);

  const saveDinnerPreferences = async (userId: string, prefs: Omit<DinnerPreferences, 'id'>) => {
    if (!user || !userId) return;
    await setDoc(doc(db, 'users', user.uid, 'dinnerPreferences', userId), prefs);
  };

  const disconnectGoogleCalendar = () => {
    if (gapiClient && gapiClient.client.getToken()) {
      // GAPI doesn't have a revoke method, so we just clear the token.
      gapiClient.client.setToken(null);
    }
    setIsGoogleCalendarConnected(false);
    setAvailableCalendars([]);
    setEvents([]); // Clear calendar events from state
  };

  const value = {
    user, loading, logIn, logOut,
    tasks, addTask, updateTask, deleteTask, reorderTask, setTaskReminder,
    reflections, getReflection, saveReflection,
    events, addEvent, updateEvent, deleteEvent,
    dinnerPlans, saveDinnerPlan,
    featureFeedback, addFeatureFeedback,
    chatHistory, saveChatHistory,
    getDinnerPreferences, saveDinnerPreferences,
    isGoogleCalendarConnected, isGoogleSyncing,
    calendarId, availableCalendars, selectCalendar, refreshCalendarList,
    disconnectGoogleCalendar, syncGoogleCalendarEvents, lastCalendarSyncAt,
    refreshCalendarNow, updateDinnerPlanOnCalendar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
