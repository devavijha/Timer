/**
 * Save meditation data for offline use
 */
export const saveMeditationData = async (data: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('meditationData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving meditation data:', error);
  }
};

/**
 * Load meditation data for offline use
 */
export const loadMeditationData = async (): Promise<any | null> => {
  try {
    const value = await AsyncStorage.getItem('meditationData');
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error loading meditation data:', error);
    return null;
  }
};

/**
 * Remove meditation data
 */
export const removeMeditationData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('meditationData');
  } catch (error) {
    console.error('Error removing meditation data:', error);
  }
};
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistor } from '../store';

/**
 * Clear only auth-related data, keep user data (tasks, habits, etc.)
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    // Only clear specific auth-related keys, not all data
    const authKeys = [
      'auth_token',
      'refresh_token',
      'user_session',
    ];
    
    await AsyncStorage.multiRemove(authKeys);
    
    console.log('Auth data cleared successfully, user data preserved');
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

/**
 * Clear all persisted data and reset the app to initial state
 */
export const clearAllPersistedData = async (): Promise<void> => {
  try {
    // Purge the persist store
    await persistor.purge();
    
    // Clear all AsyncStorage data
    await AsyncStorage.clear();
    
    console.log('All persisted data cleared successfully');
  } catch (error) {
    console.error('Error clearing persisted data:', error);
    throw error;
  }
};

/**
 * Clear specific keys from AsyncStorage
 */
export const clearStorageKeys = async (keys: string[]): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(keys);
    console.log(`Cleared storage keys: ${keys.join(', ')}`);
  } catch (error) {
    console.error('Error clearing storage keys:', error);
    throw error;
  }
};

/**
 * Get all stored keys for debugging
 */
export const getAllStorageKeys = async (): Promise<readonly string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('All storage keys:', keys);
    return keys;
  } catch (error) {
    console.error('Error getting storage keys:', error);
    return [];
  }
};
