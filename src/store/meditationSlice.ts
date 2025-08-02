import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MeditationSession } from '../types';

interface MeditationState {
  sessions: MeditationSession[];
  currentSession: MeditationSession | null;
  isActive: boolean;
  timeRemaining: number;
  loading: boolean;
  error: string | null;
}

const initialState: MeditationState = {
  sessions: [
    {
      id: '1',
      name: 'Morning Clarity',
      description: 'Start your day with focus and intention',
      duration: 10,
      type: 'guided',
      icon: 'wb-sunny',
      color: '#4ECDC4',
    },
    {
      id: '2',
      name: 'Deep Breathing',
      description: 'Simple breathing exercises for relaxation',
      duration: 5,
      type: 'breathing',
      icon: 'air',
      color: '#95E1A3',
    },
    {
      id: '3',
      name: 'Evening Unwind',
      description: 'Release the day and prepare for rest',
      duration: 15,
      type: 'relaxation',
      icon: 'nightlight',
      color: '#FF9999',
    },
    {
      id: '4',
      name: 'Focus Boost',
      description: 'Enhance concentration and mental clarity',
      duration: 20,
      type: 'guided',
      icon: 'center-focus-strong',
      color: '#FFE066',
    },
  ],
  currentSession: null,
  isActive: false,
  timeRemaining: 0,
  loading: false,
  error: null,
};

const meditationSlice = createSlice({
  name: 'meditation',
  initialState,
  reducers: {
startSession: (state, action: PayloadAction<string | { sessionId: string; duration?: number }>) => {
  let sessionId: string;
  let customDuration: number | undefined;
  if (typeof action.payload === 'string') {
    sessionId = action.payload;
  } else {
    sessionId = action.payload.sessionId;
    customDuration = action.payload.duration;
  }
  const session = state.sessions.find(s => s.id === sessionId);
  if (session) {
    state.currentSession = { ...session, duration: customDuration ?? session.duration };
    state.isActive = true;
    state.timeRemaining = (customDuration ?? session.duration) * 60; // Convert to seconds
  }
},
    pauseSession: (state) => {
      state.isActive = false;
    },
    resumeSession: (state) => {
      if (state.currentSession) {
        state.isActive = true;
      }
    },
    stopSession: (state) => {
      state.currentSession = null;
      state.isActive = false;
      state.timeRemaining = 0;
    },
    updateTimer: (state, action: PayloadAction<number>) => {
      state.timeRemaining = Math.max(0, action.payload);
      if (state.timeRemaining === 0) {
        state.isActive = false;
      }
    },
    completeSession: (state) => {
      if (state.currentSession) {
        // Mark session as completed
        const session = state.sessions.find(s => s.id === state.currentSession!.id);
        if (session) {
          session.completed_at = new Date().toISOString();
        }
      }
      state.currentSession = null;
      state.isActive = false;
      state.timeRemaining = 0;
    },
    addCustomSession: (state, action: PayloadAction<{
      name: string;
      description: string;
      duration: number;
      type: 'breathing' | 'guided' | 'relaxation';
      color: string;
      icon: string;
    }>) => {
      const newSession: MeditationSession = {
        id: Date.now().toString(),
        name: action.payload.name,
        description: action.payload.description,
        duration: action.payload.duration,
        type: action.payload.type,
        icon: action.payload.icon,
        color: action.payload.color,
      };
      state.sessions.push(newSession);
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
      if (state.currentSession?.id === action.payload) {
        state.currentSession = null;
        state.isActive = false;
        state.timeRemaining = 0;
      }
    },
    clearCompletedSessions: (state) => {
      // Remove completed_at from all sessions to reset completion status
      state.sessions.forEach(session => {
        delete session.completed_at;
      });
    },
  },
});

export const {
  startSession,
  pauseSession,
  resumeSession,
  stopSession,
  updateTimer,
  completeSession,
  addCustomSession,
  deleteSession,
  clearCompletedSessions,
} = meditationSlice.actions;

// Add missing actions
export const addProgress = (data: any) => ({ type: 'meditation/addProgress', payload: data });
export const setActiveDate = (date: string) => ({ type: 'meditation/setActiveDate', payload: date });

export default meditationSlice.reducer;