import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { completeOnboarding } from '../store/userSlice';

const { width, height } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGetStarted = () => {
    dispatch(completeOnboarding());
    navigation.navigate('NicknameScreen');
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB', '#90CAF9']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Illustration Area */}
          <View style={styles.illustrationContainer}>
            {/* Custom Productivity & Wellness Illustration */}
            {/* You must add a PNG named 'productivity_wellness.png' to assets/ for this to work! */}
            <View style={styles.circleImageWrapper}>
              {require('../components/ProductivityWellnessImage').default()}
            </View>
            <View style={styles.bubbleContainer}>
              <View style={styles.speechBubble}>
                <Text style={styles.bubbleText}>Let's Start!</Text>
              </View>
            </View>
          </View>

          {/* Title and Description */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>To-Do List</Text>
            <Text style={styles.description}>
              Boost your productivity with our all-in-one task management app. 
              Organize your tasks, build lasting habits, and achieve your goals 
              with mindful meditation and progress tracking.
            </Text>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <LinearGradient
              colors={['#4ECDC4', '#44B5AC']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Page Indicator */}
          <View style={styles.pageIndicator}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  illustrationContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  circleImageWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  personContainer: {
    marginTop: -20,
  },
  bubbleContainer: {
    alignItems: 'flex-end',
    width: '100%',
    paddingRight: 40,
  },
  speechBubble: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomRightRadius: 5,
  },
  bubbleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 30,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#BDC3C7',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#4ECDC4',
    width: 30,
  },
});

export default OnboardingScreen;
