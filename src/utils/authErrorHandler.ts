import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

export class AuthErrorHandler {
  private static isRefreshTokenError(error: any): boolean {
    if (!error || typeof error !== 'object') return false;
    
    const message = error.message || '';
    const name = error.name || '';
    
    return (
      message.includes('Invalid Refresh Token') ||
      message.includes('Refresh Token Not Found') ||
      message.includes('JWT expired') ||
      message.includes('invalid_grant') ||
      name === 'AuthSessionMissingError'
    );
  }

  static async handleAuthError(error: any): Promise<boolean> {
    console.log('Handling auth error:', error);
    
    if (this.isRefreshTokenError(error)) {
      console.log('Refresh token error detected, clearing session');
      
      try {
        // Clear invalid tokens from storage
        await this.clearAuthTokens();
        
        // Sign out locally (don't make API call if token is invalid)
        await supabase.auth.signOut({ scope: 'local' });
        
        console.log('Cleared invalid auth session');
        return true; // Indicates error was handled
      } catch (clearError) {
        console.error('Failed to clear auth session:', clearError);
        return false;
      }
    }
    
    return false; // Error was not handled
  }

  private static async clearAuthTokens(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key => 
        key.includes('supabase') || 
        key.includes('auth') || 
        key.startsWith('sb-')
      );
      
      if (authKeys.length > 0) {
        await AsyncStorage.multiRemove(authKeys);
        console.log('Cleared auth tokens:', authKeys);
      }
    } catch (error) {
      console.error('Failed to clear auth tokens:', error);
      throw error;
    }
  }

  static async ensureValidSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        const handled = await this.handleAuthError(error);
        return !handled; // Return false if error was handled (session invalid)
      }
      
      return !!session; // Return true if session exists
    } catch (error) {
      console.error('Failed to check session validity:', error);
      await this.handleAuthError(error);
      return false;
    }
  }
}

export default AuthErrorHandler;
