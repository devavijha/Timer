import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Habit } from '../types';
import { SupabaseService } from '../services/supabaseService';

// Async thunks for Supabase operations
export const loadUserHabitsAsync = createAsyncThunk(
  'habits/loadUserHabits',
  async (userId: string, { rejectWithValue }) => {
    try {
      const habits = await SupabaseService.getHabits(userId);
      return habits;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createHabitAsync = createAsyncThunk(
  'habits/createHabit',
  async ({ userId, habitData }: { 
    userId: string; 
    habitData: { name: string; color: string; icon: string } 
  }, { rejectWithValue }) => {
    try {
      const newHabitData = {
        name: habitData.name,
        color: habitData.color,
        icon: habitData.icon,
        streak: 0,
        longestStreak: 0,
        completedDates: [],
      };
      const habit = await SupabaseService.createHabit(userId, newHabitData);
      return habit;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateHabitAsync = createAsyncThunk(
  'habits/updateHabit',
  async ({ habitId, updates }: { habitId: string; updates: Partial<Habit> }, { rejectWithValue }) => {
    try {
      const habit = await SupabaseService.updateHabit(habitId, updates);
      return habit;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteHabitAsync = createAsyncThunk(
  'habits/deleteHabit',
  async (habitId: string, { rejectWithValue }) => {
    try {
      await SupabaseService.deleteHabit(habitId);
      return habitId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface HabitsState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
}

const initialState: HabitsState = {
  habits: [], // Start with empty habits for new users
  loading: false,
  error: null,
};

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    // Local-only actions for immediate UI updates (optimistic updates)
    toggleHabitCompletionLocal: (state, action: PayloadAction<{ habitId: string; date: string }>) => {
      const habit = state.habits.find(h => h.id === action.payload.habitId);
      if (habit) {
        const dateIndex = habit.completedDates.indexOf(action.payload.date);
        if (dateIndex > -1) {
          // Remove date if already completed
          habit.completedDates.splice(dateIndex, 1);
        } else {
          // Add date if not completed
          habit.completedDates.push(action.payload.date);
          habit.completedDates.sort();
        }
        
        // Recalculate streak
        const today = new Date().toISOString().split('T')[0];
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        const sortedDates = [...habit.completedDates].sort();
        for (let i = sortedDates.length - 1; i >= 0; i--) {
          const date = new Date(sortedDates[i]);
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() - (sortedDates.length - 1 - i));
          
          if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            tempStreak++;
            if (i === sortedDates.length - 1) currentStreak = tempStreak;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        
        habit.streak = currentStreak;
        habit.longestStreak = Math.max(habit.longestStreak, longestStreak, currentStreak);
      }
    },
    clearAllHabits: (state) => {
      state.habits = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Load user habits
      .addCase(loadUserHabitsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserHabitsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload;
        state.error = null;
      })
      .addCase(loadUserHabitsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create habit
      .addCase(createHabitAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHabitAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.habits.push(action.payload);
        state.error = null;
      })
      .addCase(createHabitAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update habit
      .addCase(updateHabitAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHabitAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.habits.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateHabitAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete habit
      .addCase(deleteHabitAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHabitAsync.fulfilled, (state, action) => {
        state.loading = false;
        const deletedHabitId = action.payload;
        state.habits = state.habits.filter(h => h.id !== deletedHabitId);
        state.error = null;
      })
      .addCase(deleteHabitAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Async action for toggling habit completion that combines local update with Supabase sync
export const toggleHabitCompletion = createAsyncThunk(
  'habits/toggleHabitCompletion',
  async ({ habitId, date }: { habitId: string; date: string }, { getState, dispatch, rejectWithValue }) => {
    try {
      // First, update locally for immediate UI response
      dispatch(toggleHabitCompletionLocal({ habitId, date }));
      
      // Get the updated habit from state
      const state = getState() as any;
      const updatedHabit = state.habits.habits.find((h: Habit) => h.id === habitId);
      
      if (updatedHabit) {
        // Sync with Supabase
        await SupabaseService.updateHabit(habitId, {
          completedDates: updatedHabit.completedDates,
          streak: updatedHabit.streak,
          longestStreak: updatedHabit.longestStreak,
        });
      }
      
      return { habitId, date };
    } catch (error: any) {
      // If Supabase update fails, revert the local change
      dispatch(toggleHabitCompletionLocal({ habitId, date }));
      return rejectWithValue(error.message);
    }
  }
);

export const { toggleHabitCompletionLocal, clearAllHabits } = habitsSlice.actions;
export default habitsSlice.reducer;