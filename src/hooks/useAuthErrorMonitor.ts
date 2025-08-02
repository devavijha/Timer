import { useEffect } from 'react';
import { supabase } from '../config/supabase';
import { AuthErrorHandler } from '../utils/authErrorHandler';

/**
 * Hook to monitor and handle authentication errors globally
 */
export const useAuthErrorMonitor = () => {
  useEffect(() => {
    // Set up global error handler for Supabase
    const originalLog = console.error;
    
    console.error = (...args) => {
      // Check if this is an auth error
      const errorMessage = args.join(' ');
      
      if (
        errorMessage.includes('Invalid Refresh Token') ||
        errorMessage.includes('Refresh Token Not Found') ||
        errorMessage.includes('JWT expired')
      ) {
        console.log('🔐 Auth error detected and handled silently');
        
        // Handle the error asynchronously
        AuthErrorHandler.handleAuthError(new Error(errorMessage))
          .catch((error) => {
            console.warn('Failed to handle auth error:', error);
          });
        
        // Don't log the error to reduce noise
        return;
      }
      
      // For non-auth errors, use original console.error
      originalLog.apply(console, args);
    };
    
    return () => {
      // Restore original console.error
      console.error = originalLog;
    };
  }, []);

  // Also set up a periodic session check
  useEffect(() => {
    const checkSession = async () => {
      const isValid = await AuthErrorHandler.ensureValidSession();
      if (!isValid) {
        console.log('🔐 Session invalid, cleared automatically');
      }
    };
    
    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
};

export default useAuthErrorMonitor;
