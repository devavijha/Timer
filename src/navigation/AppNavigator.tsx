import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import MainTabNavigator from './MainTabNavigator';
import FocusModeScreen from '../screens/FocusModeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import NicknameScreen from '../screens/NicknameScreen';
import RegionSelectionScreen from '../screens/RegionSelectionScreen';
import NotificationPermissionScreen from '../screens/NotificationPermissionScreen';
import StudyTimeScreen from '../screens/StudyTimeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner component
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
          <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
          <Stack.Screen name="NicknameScreen" component={NicknameScreen} />
          <Stack.Screen name="RegionSelectionScreen" component={RegionSelectionScreen} />
          <Stack.Screen name="StudyTimeScreen" component={StudyTimeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="FocusModeScreen" component={FocusModeScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
