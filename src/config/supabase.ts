import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use process.env for Expo environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    debug: false, // Disable verbose logging for better performance
    flowType: 'pkce', // More secure and faster
  },
  // Add global error handling
  global: {
    headers: {
      'x-client-info': 'focus-app-react-native',
    },
  },
  // Reduce network overhead
  realtime: {
    params: {
      eventsPerSecond: 2, // Limit realtime events
    },
  },
});

// Handle auth state changes with better error handling (minimal logging)
supabase.auth.onAuthStateChange(async (event, session) => {
  // Only log critical events, not routine operations
  if (event === 'SIGNED_OUT' || (!session && event === 'TOKEN_REFRESHED')) {
    if (__DEV__) console.log('Auth event:', event);
  }
  
  // Handle token refresh errors
  if (event === 'TOKEN_REFRESHED' && !session) {
    try {
      await AsyncStorage.removeItem('supabase.auth.token');
      // Clear Supabase's default storage key format
      const url = new URL(supabaseUrl);
      const storageKey = `sb-${url.hostname.replace(/\./g, '-')}-auth-token`;
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      if (__DEV__) console.error('Failed to clear auth tokens:', error);
    }
  }
  
  if (event === 'SIGNED_OUT') {
    try {
      // Clear any remaining auth tokens
      await AsyncStorage.removeItem('supabase.auth.token');
      const url = new URL(supabaseUrl);
      const storageKey = `sb-${url.hostname.replace(/\./g, '-')}-auth-token`;
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      if (__DEV__) console.error('Failed to clear auth storage:', error);
    }
  }
});