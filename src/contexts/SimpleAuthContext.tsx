import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { clearAllPersistedData, clearAuthData } from '../utils/storage';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for stored user on app start
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      console.log('CheckStoredUser called');
      const storedUser = await AsyncStorage.getItem('authUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Add preferences if they don't exist (for backward compatibility)
        const userWithPreferences = {
          ...userData,
          preferences: userData.preferences || {
            notifications: true,
            theme: 'light',
            language: 'en',
          }
        };
        setUser(userWithPreferences);
        // Update both auth and user Redux stores
        dispatch({ type: 'auth/setAuthUser', payload: userWithPreferences });
        dispatch({ type: 'user/setUser', payload: userWithPreferences });
        console.log('Stored user found and Redux updated:', userWithPreferences);
      } else {
        console.log('No stored user found');
      }
    } catch (error) {
      console.error('Error checking stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('SignIn called with:', { email });
      
      // Simple mock authentication
      const mockUser = {
        id: '1',
        email: email,
        name: 'Demo User',
        avatar: '',
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en',
        },
      };
      
      await AsyncStorage.setItem('authUser', JSON.stringify(mockUser));
      setUser(mockUser);
      // Update both auth and user Redux stores
      dispatch({ type: 'auth/setAuthUser', payload: mockUser });
      dispatch({ type: 'user/setUser', payload: mockUser });
      console.log('User signed in and Redux updated with setAuthUser action');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log('SignUp called with:', { email, name });
      
      // Simple mock registration
      const mockUser = {
        id: '1',
        email: email,
        name: name,
        avatar: '',
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en',
        },
      };
      
      await AsyncStorage.setItem('authUser', JSON.stringify(mockUser));
      setUser(mockUser);
      // Update both auth and user Redux stores
      dispatch({ type: 'auth/setAuthUser', payload: mockUser });
      dispatch({ type: 'user/setUser', payload: mockUser });
      console.log('User signed up and Redux updated with setAuthUser action');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('SignOut called');
      setUser(null);
      
      // Don't clear any data - let Redux Persist handle data persistence
      console.log('User signed out successfully, data preserved via Redux Persist');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
