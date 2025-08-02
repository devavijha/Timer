import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TimerSession {
  taskId: string;
  start: number;
  end: number;
  completed: boolean;
}

interface TimerState {
  sessions: TimerSession[];
}

const initialState: TimerState = {
  sessions: [],
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    addSession(state, action: PayloadAction<TimerSession>) {
      state.sessions.push(action.payload);
    },
    clearSessions(state) {
      state.sessions = [];
    },
  },
});

export const { addSession, clearSessions } = timerSlice.actions;
export default timerSlice.reducer;
