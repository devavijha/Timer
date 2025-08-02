import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Goal } from '../types';
import { SupabaseService } from '../services/supabaseService';

// Async thunks for Supabase operations
export const loadUserGoalsAsync = createAsyncThunk(
  'goals/loadUserGoals',
  async (userId: string, { rejectWithValue }) => {
    try {
      const goals = await SupabaseService.getGoals(userId);
      return goals;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGoalAsync = createAsyncThunk(
  'goals/createGoal',
  async ({ userId, goalData }: { 
    userId: string; 
    goalData: {
      name: string;
      description: string;
      target: number;
      color: string;
      icon: string;
      type: 'weekly' | 'monthly' | 'daily';
    }
  }, { rejectWithValue }) => {
    try {
      const newGoalData = {
        name: goalData.name,
        description: goalData.description,
        progress: 0,
        target: goalData.target,
        color: goalData.color,
        icon: goalData.icon,
        type: goalData.type,
      };
      const goal = await SupabaseService.createGoal(userId, newGoalData);
      return goal;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGoalAsync = createAsyncThunk(
  'goals/updateGoal',
  async ({ goalId, updates }: { goalId: string; updates: Partial<Goal> }, { rejectWithValue }) => {
    try {
      const goal = await SupabaseService.updateGoal(goalId, updates);
      return goal;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGoalAsync = createAsyncThunk(
  'goals/deleteGoal',
  async (goalId: string, { rejectWithValue }) => {
    try {
      await SupabaseService.deleteGoal(goalId);
      return goalId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [], // Start with empty goals for new users
  loading: false,
  error: null,
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    // Local-only action for immediate UI updates
    updateGoalProgressLocal: (state, action: PayloadAction<{ goalId: string; progress: number }>) => {
      const goal = state.goals.find(g => g.id === action.payload.goalId);
      if (goal) {
        goal.progress = Math.min(Math.max(action.payload.progress, 0), goal.target);
      }
    },
    clearAllGoals: (state) => {
      state.goals = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Load user goals
      .addCase(loadUserGoalsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserGoalsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
        state.error = null;
      })
      .addCase(loadUserGoalsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create goal
      .addCase(createGoalAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoalAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.push(action.payload);
        state.error = null;
      })
      .addCase(createGoalAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update goal
      .addCase(updateGoalAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoalAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.goals.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateGoalAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete goal
      .addCase(deleteGoalAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoalAsync.fulfilled, (state, action) => {
        state.loading = false;
        const deletedGoalId = action.payload;
        state.goals = state.goals.filter(g => g.id !== deletedGoalId);
        state.error = null;
      })
      .addCase(deleteGoalAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Async action for updating goal progress that combines local update with Supabase sync
export const updateGoalProgress = createAsyncThunk(
  'goals/updateGoalProgress',
  async ({ goalId, progress }: { goalId: string; progress: number }, { getState, dispatch, rejectWithValue }) => {
    try {
      // First, update locally for immediate UI response
      dispatch(updateGoalProgressLocal({ goalId, progress }));
      
      // Get the updated goal from state
      const state = getState() as any;
      const updatedGoal = state.goals.goals.find((g: Goal) => g.id === goalId);
      
      if (updatedGoal) {
        // Sync with Supabase
        await SupabaseService.updateGoal(goalId, {
          progress: updatedGoal.progress,
        });
      }
      
      return { goalId, progress };
    } catch (error: any) {
      // If Supabase update fails, we should reload from server to get correct state
      return rejectWithValue(error.message);
    }
  }
);

export const { updateGoalProgressLocal, clearAllGoals } = goalsSlice.actions;
export default goalsSlice.reducer;
