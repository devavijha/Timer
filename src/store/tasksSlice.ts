import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TaskCategory, Task } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { queueOfflineChange } from '../utils/offlineQueue';
import { syncChangeToBackend } from '../services/syncService';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface TasksState {
  categories: TaskCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  categories: [], 
  loading: false,
  error: null,
};

export const loadUserTasksAsync = createAsyncThunk(
  'tasks/loadUserTasks',
  async (userId: string, { rejectWithValue }) => {
    try {
      const categories = await SupabaseService.getTaskCategories(userId);
      return categories;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCategoryAsync = createAsyncThunk(
  'tasks/createCategory',
  async ({ userId, name, color }: { userId: string; name: string; color: string }, { rejectWithValue }) => {
    try {
      const category = await SupabaseService.createTaskCategory(userId, name, color);
      return category;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTask = (task) => async (dispatch) => {
  dispatch(tasksSlice.actions.addTask(task));
  const isConnected = useNetworkStatus();
  const change = { type: 'ADD_TASK', payload: task };
  if (isConnected) {
    try {
      await syncChangeToBackend(change);
    } catch (e) {
      await queueOfflineChange(change);
    }
  } else {
    await queueOfflineChange(change);
  }
};
export const createTaskAsync = createAsyncThunk(
  'tasks/createTask',
  async ({ userId, categoryId, title, timer }: { userId: string; categoryId: string; title: string; timer?: number }, { rejectWithValue }) => {
    try {
      const task = await SupabaseService.createTask(userId, categoryId, title, timer);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }, { rejectWithValue }) => {
    try {
      const task = await SupabaseService.updateTask(taskId, updates);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await SupabaseService.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCategoryAsync = createAsyncThunk(
  'tasks/deleteCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      await SupabaseService.deleteTaskCategory(categoryId);
      return categoryId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface TasksState {
  categories: TaskCategory[];
  loading: boolean;
  error: string | null;
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Keep some reducers for optimistic updates, but main data will come from Supabase
    clearTasks: (state) => {
      state.categories = [];
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      // Find category and push task
      const task = action.payload;
      const category = state.categories.find(cat => cat.id === task.category_id);
      if (category) {
        category.tasks = category.tasks ? [...category.tasks, task] : [task];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load user tasks
      .addCase(loadUserTasksAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserTasksAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(loadUserTasksAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create category
      .addCase(createCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        state.error = null;
      })
      .addCase(createCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create task
      .addCase(createTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTaskAsync.fulfilled, (state, action) => {
        state.loading = false;
        const task = action.payload;
        const category = state.categories.find(c => c.id === task.category_id);
        if (category) {
          category.tasks.push(task);
          // Update progress
          const completedTasks = category.tasks.filter(t => t.completed).length;
          category.progress = category.tasks.length > 0 
            ? Math.round((completedTasks / category.tasks.length) * 100) 
            : 0;
        }
        state.error = null;
      })
      .addCase(createTaskAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update task
      .addCase(updateTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload;
        const category = state.categories.find(c => c.id === updatedTask.category_id);
        if (category) {
          const taskIndex = category.tasks.findIndex(t => t.id === updatedTask.id);
          if (taskIndex !== -1) {
            category.tasks[taskIndex] = updatedTask;
            // Update progress
            const completedTasks = category.tasks.filter(t => t.completed).length;
            category.progress = category.tasks.length > 0 
              ? Math.round((completedTasks / category.tasks.length) * 100) 
              : 0;
          }
        }
        state.error = null;
      })
      .addCase(updateTaskAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete task
      .addCase(deleteTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.loading = false;
        const deletedTaskId = action.payload;
        // Find and remove task from categories
        state.categories.forEach(category => {
          category.tasks = category.tasks.filter(t => t.id !== deletedTaskId);
          // Update progress
          const completedTasks = category.tasks.filter(t => t.completed).length;
          category.progress = category.tasks.length > 0 
            ? Math.round((completedTasks / category.tasks.length) * 100) 
            : 0;
        });
        state.error = null;
      })
      .addCase(deleteTaskAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete category
      .addCase(deleteCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        const deletedCategoryId = action.payload;
        state.categories = state.categories.filter(c => c.id !== deletedCategoryId);
        state.error = null;
      })
      .addCase(deleteCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearTasks,
  setLoading,
  setError
} = tasksSlice.actions;

export default tasksSlice.reducer;