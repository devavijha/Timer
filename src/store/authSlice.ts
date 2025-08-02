import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SupabaseService } from '../services/supabaseService';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const signInAsync = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { user } = await SupabaseService.signIn(email, password);
      if (user) {
        const profile = await SupabaseService.getUserProfile(user.id);
        return profile;
      }
      throw new Error('No user returned');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signUpAsync = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name }: { email: string; password: string; name: string }, { rejectWithValue }) => {
    try {
      const { user } = await SupabaseService.signUp(email, password, name);
      if (user) {
        const profile = await SupabaseService.getUserProfile(user.id);
        return profile;
      }
      throw new Error('No user returned');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOutAsync = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await SupabaseService.signOut();
      return; // Success - no return value needed
    } catch (error: any) {
      // If the session is already missing, treat it as successful logout
      if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
        console.log('Session already missing, treating as successful logout');
        return; // Don't reject, just return success
      }
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signInAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signInAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Sign Up
      .addCase(signUpAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signUpAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Sign Out
      .addCase(signOutAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signOutAsync.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(signOutAsync.rejected, (state, action) => {
        // Even if sign out fails, clear the auth state locally
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;