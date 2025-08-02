import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import all your slices
import userSlice from './userSlice';
import tasksSlice from './tasksSlice';
import habitsSlice from './habitsSlice';
import goalsSlice from './goalsSlice';
import meditationSlice from './meditationSlice';
import authSlice from './authSlice';
import timerSlice from './timerSlice';

// Combine all reducers
const appReducer = combineReducers({
  user: userSlice,
  tasks: tasksSlice,
  habits: habitsSlice,
  goals: goalsSlice,
  meditation: meditationSlice,
  auth: authSlice,
  timer: timerSlice,
});

// Root reducer - DON'T reset state on logout, let persistence handle it
const rootReducer = (state: any, action: any) => {
  return appReducer(state, action);
};

// Persist configuration - persist all user data
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'tasks', 'habits', 'goals', 'meditation', 'timer'], // Persist user data, let auth handle itself
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export auth actions
export { setUser as setAuthUser, resetAuth } from './authSlice';