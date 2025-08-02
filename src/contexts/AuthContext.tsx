import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { SupabaseService } from '../services/supabaseService';
import { User } from '../types';
import { initializeNewUser } from '../utils/dataUtils';
import { clearAllPersistedData, clearAuthData } from '../utils/storage';
import { AuthErrorHandler } from '../utils/authErrorHandler';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  forceLogout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  retryProfileCreation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Force clear all authentication data (for testing)
  const forceLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local state
      setUser(null);
      setUserProfile(null);
      
      // Clear Redux stores - dispatch actions directly
      dispatch({ type: 'auth/resetAuth' });
      dispatch({ type: 'user/clearUser' });
      
      // Don't clear AsyncStorage - let Redux Persist handle data persistence
      console.log('Force logout completed - data preserved via Redux Persist');
    } catch (error: any) {
      // If session is already missing, still proceed with logout
      if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
        console.log('Session already missing during force logout, continuing...');
        
        // Clear local state anyway
        setUser(null);
        setUserProfile(null);
        
        // Clear Redux stores
        dispatch({ type: 'auth/resetAuth' });
        dispatch({ type: 'user/clearUser' });
        
        console.log('Force logout completed - data preserved via Redux Persist');
        return; // Don't throw error
      }
      
      console.error('Force logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!supabase || !supabase.auth) {
      console.error('Supabase client is not properly initialized');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.warn('Session retrieval error:', error.message);
        
        // Use AuthErrorHandler to handle the error
        const handled = await AuthErrorHandler.handleAuthError(error);
        if (handled) {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }
      }
      
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(async (error) => {
      console.error('Failed to get session:', error);
      
      // Try to handle the error gracefully
      await AuthErrorHandler.handleAuthError(error);
      
      // Clear local state and continue
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'with session' : 'no session');
        
        // Handle refresh token errors gracefully
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (event === 'SIGNED_OUT') {
            // Clear any invalid tokens
            try {
              await AsyncStorage.removeItem('supabase.auth.token');
              console.log('Cleared invalid auth tokens');
            } catch (error) {
              console.warn('Failed to clear auth tokens:', error);
            }
          }
        }
        
        // Handle specific auth errors
        if (event === 'SIGNED_OUT' && !session) {
          console.log('User signed out or token expired, clearing state');
          setUser(null);
          setUserProfile(null);
          
          // Clear Redux stores when user logs out
          dispatch({ type: 'auth/resetAuth' });
          dispatch({ type: 'user/clearUser' });
          
          setLoading(false);
          return;
        }
        
        // Handle initial session check
        if (event === 'INITIAL_SESSION') {
          console.log('Initial session check:', session ? 'session found' : 'no session');
          if (!session) {
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }
        }
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await SupabaseService.getUserProfile(userId);
      setUserProfile(profile);
      
      // Initialize new user with clean data
      initializeNewUser(dispatch, profile);
      
      console.log('User profile loaded:', profile.name);
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // For certain errors, we might want to handle them differently
      if (error instanceof Error) {
        if (error.message.includes('database permissions') || error.message.includes('row-level security')) {
          console.error('Database permission issue detected. Please check RLS policies.');
          // You might want to show a specific error message to the user here
        }
      }
      
      // Still set loading to false even if profile loading fails
      // The user is authenticated but doesn't have a profile yet
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user } = await SupabaseService.signIn(email, password);
      if (user) {
        await loadUserProfile(user.id);
      }
    } catch (error) {
      setLoading(false);
      
      // Handle auth errors gracefully
      const handled = await AuthErrorHandler.handleAuthError(error);
      if (!handled) {
        throw error; // Re-throw if not an auth error we can handle
      }
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { user } = await SupabaseService.signUp(email, password, name);
      if (user) {
        await loadUserProfile(user.id);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SupabaseService.signOut();
      setUser(null);
      setUserProfile(null);
      
      // Don't clear any data - let Redux Persist handle data persistence
      console.log('User signed out successfully, data preserved via Redux Persist');
    } catch (error: any) {
      // If session is already missing, treat as successful logout
      if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
        console.log('Session already missing, treating as successful logout');
        setUser(null);
        setUserProfile(null);
        console.log('User signed out successfully, data preserved via Redux Persist');
        return; // Don't throw error
      }
      
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const retryProfileCreation = async () => {
    if (user && !userProfile) {
      console.log('Retrying profile creation for user:', user.id);
      try {
        const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        const email = user.email || '';
        const profile = await SupabaseService.createUserProfile(user.id, name, email);
        setUserProfile(profile);
        dispatch({ type: 'auth/setAuthUser', payload: profile });
        dispatch({ type: 'user/setUser', payload: profile });
        console.log('Profile created successfully:', profile.name);
      } catch (error) {
        console.error('Failed to retry profile creation:', error);
        throw error;
      }
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    forceLogout,
    refreshProfile,
    retryProfileCreation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};