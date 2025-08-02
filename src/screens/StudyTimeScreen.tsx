import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const StudyTimeScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.speechBubble}>
        <Text style={styles.bubbleText}>
          Let’s find where you spend time on your phone to help you study better!
        </Text>
      </View>
      <View style={styles.mascotCircle}>
        <MaterialIcons name="hourglass-empty" size={64} color="#FF9900" style={styles.mascot} />
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login' as never)}>
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  speechBubble: {
    backgroundColor: '#23272F',
    borderRadius: 18,
    padding: 22,
    marginBottom: 32,
    maxWidth: 340,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  bubbleText: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
  },
  mascotCircle: {
    backgroundColor: 'rgba(255, 153, 0, 0.15)',
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    shadowColor: '#FF9999',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  mascot: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#4ECDC4',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 18,
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    color: '#0F1419',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default StudyTimeScreen;
