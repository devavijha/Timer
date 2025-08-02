import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';

/**
 * Enhanced debugging functions for data persistence
 */

export const debugPersistence = async () => {
  console.log('🔍 === DEBUGGING PERSISTENCE ===');
  
  try {
    // 1. Check all AsyncStorage keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📱 AsyncStorage keys:', allKeys);
    
    // 2. Check the main persist key
    const persistData = await AsyncStorage.getItem('persist:root');
    if (persistData) {
      const parsed = JSON.parse(persistData);
      console.log('💾 Persisted data structure:', Object.keys(parsed));
      
      // Check each slice
      ['user', 'tasks', 'habits', 'goals', 'meditation'].forEach(slice => {
        if (parsed[slice]) {
          try {
            const sliceData = JSON.parse(parsed[slice]);
            console.log(`📊 ${slice} data:`, sliceData);
          } catch (e) {
            console.log(`📊 ${slice} data (raw):`, parsed[slice]);
          }
        }
      });
    } else {
      console.log('❌ No persisted data found');
    }
    
    // 3. Check current Redux state
    const currentState = store.getState();
    console.log('🔄 Current Redux state keys:', Object.keys(currentState));
    console.log('🔄 Tasks categories count:', currentState.tasks?.categories?.length || 0);
    console.log('🔄 Habits count:', currentState.habits?.habits?.length || 0);
    console.log('🔄 Auth state:', {
      isAuthenticated: currentState.auth?.isAuthenticated,
      hasUser: !!currentState.auth?.user
    });
    
  } catch (error) {
    console.error('❌ Error debugging persistence:', error);
  }
  
  console.log('🔍 === END DEBUGGING ===');
};

export const addTestDataToPersistence = () => {
  console.log('➕ Debug function disabled - using Supabase async operations instead');
  console.log('✅ Test data skipped (debug function disabled)');
};

export const clearAllTestData = async () => {
  try {
    console.log('🗑️ Clearing all test data...');
    await AsyncStorage.clear();
    console.log('✅ All data cleared');
    
    // Reload the app state
    setTimeout(() => {
      debugPersistence();
    }, 1000);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};
