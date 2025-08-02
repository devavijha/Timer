import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  hasCompletedOnboarding: boolean;
}

const initialState: UserState = {
  user: null, // Start with no user for new users
  loading: false,
  error: null,
  hasCompletedOnboarding: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<User['preferences']>>) => {
      if (state.user) {
        state.user.preferences = { 
          ...state.user.preferences, 
          ...action.payload 
        };
      }
    },
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
    },
    resetOnboarding: (state) => {
      state.hasCompletedOnboarding = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.hasCompletedOnboarding = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUser,
  updateUser,
  updateUserPreferences,
  completeOnboarding,
  resetOnboarding,
  clearUser,
  setLoading,
  setError,
} = userSlice.actions;
export default userSlice.reducer;