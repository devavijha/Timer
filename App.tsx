import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistGate } from 'redux-persist/integration/react';

// Redux Store
import { store, persistor } from './src/store';

// Auth Context
import { AuthProvider } from './src/contexts/AuthContext';

// Error Boundary
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Redux actions
import { setUser, completeOnboarding } from './src/store/userSlice';

// Auth error monitoring
import { useAuthErrorMonitor } from './src/hooks/useAuthErrorMonitor';

// Simple loading component
const LoadingSpinner: React.FC<{text?: string; color?: string}> = ({ text = 'Loading...', color = '#4ECDC4' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={color} />
    <Text style={{ color, fontSize: 16, marginTop: 10 }}>{text}</Text>
  </View>
);

// App content with Redux setup (this component is now inside the Provider)
const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('App initializing...');
        // Only check onboarding status, let AuthContext handle user authentication
        const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');

        console.log('Stored data:', { onboardingComplete });

        if (onboardingComplete === 'true') {
          console.log('Completing onboarding');
          dispatch(completeOnboarding());
        }

        setIsLoading(false);
        console.log('App initialization complete');
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (isLoading) {
    return <LoadingSpinner text="Initializing app..." color="#4ECDC4" />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </>
  );
};

// Main app component with Redux Provider and AuthProvider
function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingSpinner text="Loading your data..." />} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
});