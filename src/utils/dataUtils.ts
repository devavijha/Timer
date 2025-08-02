// Clear all demo/mock data for new users
import { Dispatch } from '@reduxjs/toolkit';

export const clearAllDemoData = (dispatch: Dispatch) => {
  // Clear Redux stores
  dispatch({ type: 'goals/clearAllGoals' });
  dispatch({ type: 'tasks/clearAllCategories' });
  dispatch({ type: 'habits/clearAllHabits' });
  dispatch({ type: 'meditation/clearCompletedSessions' });
  dispatch({ type: 'user/clearUser' });
};

export const initializeNewUser = (dispatch: Dispatch, userData: any) => {
  // First clear any existing demo data
  clearAllDemoData(dispatch);
  
  // Set the real user data
  dispatch({ 
    type: 'user/setUser', 
    payload: {
      id: userData.id,
      name: userData.name || userData.email?.split('@')[0] || 'User',
      email: userData.email || '',
      avatar: userData.avatar || '',
      preferences: {
        notifications: true,
        theme: 'light',
        language: 'en',
      },
    }
  });
};
