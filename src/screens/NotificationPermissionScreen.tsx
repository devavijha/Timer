import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NotificationPermissionScreen: React.FC = () => {
  const [granted, setGranted] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkPermissions = async () => {
      if (Platform.OS === 'web' || Platform.OS === 'ios' || Platform.OS === 'android') {
        // Fallback for Expo Go or unsupported
        setGranted(true);
      } else {
        setGranted(true);
      }
    };

    checkPermissions();
  }, []);

  const handleGrant = async () => {
    setGranted(true);
    setTimeout(() => {
      navigation.navigate('StudyTimeScreen' as never);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enable Notifications?</Text>
      <Text style={styles.subtitle}>Stay updated with reminders and progress.</Text>
      {!granted && (
        <Text style={styles.infoText}>
          Notifications may not work in Expo Go. You can continue and enable them later in a development build.
        </Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleGrant}>
        <Text style={styles.buttonText}>{granted ? 'Granted!' : 'Enable Notifications'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1419',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 32,
    textAlign: 'center',
  },
  infoText: {
    color: '#FF9999',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default NotificationPermissionScreen;
