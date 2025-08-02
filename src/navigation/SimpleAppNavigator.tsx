import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { completeOnboarding } from '../store/userSlice';

// Types for the store state
type RootState = {
  user: {
    hasCompletedOnboarding: boolean;
  };
  auth: {
    isAuthenticated: boolean;
  };
};

// Simple onboarding screen
const SimpleOnboardingScreen: React.FC = () => {
  const dispatch = useDispatch();

  const handleGetStarted = () => {
    dispatch(completeOnboarding());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Timer App!</Text>
      <Text style={styles.subtitle}>Your productivity companion</Text>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

// Simple auth screen
const SimpleAuthScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please Sign In</Text>
      <Text style={styles.subtitle}>Authentication screen placeholder</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

// Simple main screen
const SimpleMainScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ App Working!</Text>
      <Text style={styles.subtitle}>All systems operational</Text>
      <Text style={styles.text}>🎯 Tasks</Text>
      <Text style={styles.text}>📈 Habits</Text>
      <Text style={styles.text}>🧘 Meditation</Text>
      <Text style={styles.text}>👤 Profile</Text>
    </View>
  );
};

const SimpleAppNavigator: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated || false);
  const hasCompletedOnboarding = useSelector((state: RootState) => state.user.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <SimpleOnboardingScreen />;
  }

  if (!isAuthenticated) {
    return <SimpleAuthScreen />;
  }

  return <SimpleMainScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#4ECDC4',
    marginBottom: 30,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SimpleAppNavigator;
