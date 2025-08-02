import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../store';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-20))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const insightAnim = useState(new Animated.Value(0))[0];
  
  // Enhanced 3D greeting animations
  const pulseAnim = useState(new Animated.Value(1))[0];
  const shimmerAnim = useState(new Animated.Value(0))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];
  const colorAnim = useState(new Animated.Value(0))[0];
  const particleAnim1 = useState(new Animated.Value(0))[0];
  const particleAnim2 = useState(new Animated.Value(0))[0];
  const particleAnim3 = useState(new Animated.Value(0))[0];
  
  // Advanced 3D Background Animations
  const scrollY = useState(new Animated.Value(0))[0];
  const backgroundRotateX = useState(new Animated.Value(0))[0];
  const backgroundRotateY = useState(new Animated.Value(0))[0];
  const backgroundRotateZ = useState(new Animated.Value(0))[0];
  const floatingOrb1 = useState(new Animated.Value(0))[0];
  const floatingOrb2 = useState(new Animated.Value(0))[0];
  const floatingOrb3 = useState(new Animated.Value(0))[0];
  const perspectiveAnim = useState(new Animated.Value(0))[0];
  const depthAnim = useState(new Animated.Value(0))[0];
  const waveAnim = useState(new Animated.Value(0))[0];
  const geometryAnim1 = useState(new Animated.Value(0))[0];
  const geometryAnim2 = useState(new Animated.Value(0))[0];
  const geometryAnim3 = useState(new Animated.Value(0))[0];
  const geometryAnim4 = useState(new Animated.Value(0))[0];
  
  // Use auth context instead of Redux for user state
  const { userProfile } = useAuth();
  
  // Use typed selectors
  const { habits } = useAppSelector((state) => state.habits);
  const { categories } = useAppSelector((state) => state.tasks);
  const { goals } = useAppSelector((state) => state.goals);
  const { sessions } = useAppSelector((state) => state.meditation);
  
  // Get user preferences for dark mode
  const { user } = useAppSelector((state) => state.auth);

  // Calculate stats safely
  const completedHabitsToday = habits?.filter(habit => 
    habit.completedDates?.includes(new Date().toISOString().split('T')[0])
  ).length || 0;

  const totalTasks = categories?.reduce((total, category) => 
    total + (category.tasks?.length || 0), 0
  ) || 0;

  const completedTasks = categories?.reduce((total, category) => 
    total + (category.tasks?.filter(task => task.completed).length || 0), 0
  ) || 0;

  const activeGoals = goals?.filter(goal => goal.progress < goal.target).length || 0;

  const completedSessions = sessions?.filter(session => session.completed_at).length || 0;

  // Calculate current streak for habits
  const currentStreak = habits?.reduce((maxStreak, habit) => {
    return Math.max(maxStreak, habit.streak || 0);
  }, 0) || 0;

  // Calculate today's completion percentage with correct logic
  const totalHabitsToday = habits?.length || 0;
  const totalTasksToday = categories?.reduce((sum, cat) => 
    sum + (cat.tasks?.length || 0), 0) || 0;
  const totalPossibleToday = totalHabitsToday + totalTasksToday;
  const completedToday = completedHabitsToday + completedTasks;
  const todayCompletionPercentage = totalPossibleToday > 0 ? Math.round((completedToday / totalPossibleToday) * 100) : 0;

  // Calculate activity score for notification badge
  const todayActivityScore = completedHabitsToday + completedTasks + (goals?.filter(goal => goal.progress > 0).length || 0);

  // Dynamic greeting based on time with enhanced messages
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.name || 'Champion';
    
    if (hour < 6) return { 
      text: `Sweet Dreams, ${name}`, 
      emoji: '🌙', 
      subtitle: 'Rest well, tomorrow awaits',
      gradient: ['#2C3E50', '#4A6741']
    };
    if (hour < 12) return { 
      text: `Rise & Shine, ${name}!`, 
      emoji: '☀️', 
      subtitle: 'Time to conquer the day',
      gradient: ['#FF9800', '#FF6B35']
    };
    if (hour < 17) return { 
      text: `Keep Going, ${name}!`, 
      emoji: '⚡', 
      subtitle: 'You\'re in your prime time',
      gradient: ['#4ECDC4', '#44A08D']
    };
    if (hour < 21) return { 
      text: `Wind Down, ${name}`, 
      emoji: '🌅', 
      subtitle: 'Reflect on today\'s wins',
      gradient: ['#667eea', '#764ba2']
    };
    return { 
      text: `Good Night, ${name}`, 
      emoji: '✨', 
      subtitle: 'Tomorrow is a new adventure',
      gradient: ['#2C3E50', '#3498DB']
    };
  };

  // Enhanced productivity status with motivational messages
  const getProductivityStatus = () => {
    if (todayCompletionPercentage >= 80) return { 
      text: 'On Fire', 
      icon: 'local-fire-department', 
      color: '#FF6B6B',
      message: 'You\'re crushing it today! 🔥'
    };
    if (todayCompletionPercentage >= 60) return { 
      text: 'Great Progress', 
      icon: 'trending-up', 
      color: '#4CAF50',
      message: 'Keep up the excellent work! 📈'
    };
    if (todayCompletionPercentage >= 40) return { 
      text: 'Making Progress', 
      icon: 'timeline', 
      color: '#FF9800',
      message: 'Steady progress wins the race! 📊'
    };
    if (todayCompletionPercentage > 0) return { 
      text: 'Getting Started', 
      icon: 'play-arrow', 
      color: '#2196F3',
      message: 'Great start! Keep building momentum! ▶️'
    };
    return { 
      text: 'Ready to Begin', 
      icon: 'wb-sunny', 
      color: '#FFC107',
      message: 'Today is full of possibilities! ☀️'
    };
  };

  // Get formatted date with better styling
  const getFormattedDate = () => {
    const now = new Date();
    return {
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'short' }),
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: now.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  const dateInfo = getFormattedDate();
  const greetingData = getTimeBasedGreeting();
  const productivityStatus = getProductivityStatus();

  // Dynamic motivational quotes based on progress
  const getMotivationalQuote = () => {
    const quotes = [
      {
        text: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier",
        condition: () => todayCompletionPercentage >= 60
      },
      {
        text: "A journey of a thousand miles begins with a single step.",
        author: "Lao Tzu",
        condition: () => todayCompletionPercentage < 30
      },
      {
        text: "Excellence is not a skill, it's an attitude.",
        author: "Ralph Marston",
        condition: () => todayCompletionPercentage >= 80
      },
      {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
        condition: () => todayCompletionPercentage === 0
      },
      {
        text: "Progress, not perfection, is the goal.",
        author: "Unknown",
        condition: () => todayCompletionPercentage >= 30 && todayCompletionPercentage < 60
      }
    ];

    // Find the best matching quote based on current progress
    const matchingQuote = quotes.find(quote => quote.condition()) || quotes[0];
    return matchingQuote;
  };

  const motivationalQuote = getMotivationalQuote();

  // Enhanced 3D Animation effect for greeting and background
  useEffect(() => {
    const animateGreeting = () => {
      // Main entrance animations with enhanced 3D transforms
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();

      // Advanced 3D Background Rotations
      Animated.loop(
        Animated.timing(backgroundRotateX, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(backgroundRotateY, {
          toValue: 1,
          duration: 25000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(backgroundRotateZ, {
          toValue: 1,
          duration: 30000,
          useNativeDriver: true,
        })
      ).start();

      // Floating 3D Orbs with different speeds
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatingOrb1, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(floatingOrb1, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(floatingOrb2, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(floatingOrb2, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(floatingOrb3, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          }),
          Animated.timing(floatingOrb3, {
            toValue: 0,
            duration: 10000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Enhanced Geometric Shapes with 3D transforms
      Animated.loop(
        Animated.timing(geometryAnim1, {
          toValue: 1,
          duration: 12000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(geometryAnim2, {
          toValue: 1,
          duration: 15000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(geometryAnim3, {
          toValue: 1,
          duration: 18000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(geometryAnim4, {
          toValue: 1,
          duration: 22000,
          useNativeDriver: true,
        })
      ).start();

      // Dynamic perspective and depth effects
      Animated.loop(
        Animated.sequence([
          Animated.timing(perspectiveAnim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(perspectiveAnim, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(depthAnim, {
            toValue: 1,
            duration: 7000,
            useNativeDriver: true,
          }),
          Animated.timing(depthAnim, {
            toValue: 0,
            duration: 7000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animation for fluid motion
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();

      // Continuous pulse animation for emoji with enhanced scale
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Enhanced shimmer effect
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        })
      ).start();

      // Subtle rotation for decorative elements
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 12000,
          useNativeDriver: true,
        })
      ).start();

      // Enhanced color transition
      Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Enhanced floating particle animations
      Animated.loop(
        Animated.sequence([
          Animated.timing(particleAnim1, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(particleAnim1, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(particleAnim2, {
            toValue: 1,
            duration: 6500,
            useNativeDriver: true,
          }),
          Animated.timing(particleAnim2, {
            toValue: 0,
            duration: 6500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(particleAnim3, {
            toValue: 1,
            duration: 7500,
            useNativeDriver: true,
          }),
          Animated.timing(particleAnim3, {
            toValue: 0,
            duration: 7500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animate insights card with enhanced delay
      Animated.timing(insightAnim, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }).start();
    };

    animateGreeting();
  }, [
    fadeAnim, slideAnim, scaleAnim, insightAnim, pulseAnim, shimmerAnim, rotateAnim, colorAnim, 
    particleAnim1, particleAnim2, particleAnim3, backgroundRotateX, backgroundRotateY, backgroundRotateZ,
    floatingOrb1, floatingOrb2, floatingOrb3, perspectiveAnim, depthAnim, waveAnim,
    geometryAnim1, geometryAnim2, geometryAnim3, geometryAnim4
  ]);

  const quickActions = [
    {
      title: 'Add Task',
      icon: 'add-task',
      color: '#4ECDC4',
      onPress: () => navigation.navigate('Tasks' as never),
    },
    {
      title: 'Track Habit',
      icon: 'track-changes',
      color: '#FF9999',
      onPress: () => navigation.navigate('Habits' as never),
    },
    {
      title: 'Meditate',
      icon: 'self-improvement',
      color: '#95E1A3',
      onPress: () => navigation.navigate('Meditation' as never),
    },
    {
      title: 'Set Goal',
      icon: 'flag',
      color: '#FFE066',
      onPress: () => navigation.navigate('Progress' as never),
    },
  ];

  const statsCards = [
    {
      title: 'Tasks Completed',
      value: completedTasks,
      total: totalTasks,
      color: '#4ECDC4',
      icon: 'task-alt',
    },
    {
      title: 'Habits Today',
      value: completedHabitsToday,
      total: habits?.length || 0,
      color: '#FF9999',
      icon: 'trending-up',
    },
    {
      title: 'Active Goals',
      value: activeGoals,
      total: goals?.length || 0,
      color: '#FFE066',
      icon: 'emoji-events',
    },
    {
      title: 'Meditation',
      value: completedSessions,
      total: sessions?.length || 0,
      color: '#95E1A3',
      icon: 'spa',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, user?.preferences.theme === 'dark' && styles.darkContainer]}>
      {/* Enhanced 3D Background Layer */}
      <View style={styles.background3D}>
        {/* Floating 3D Geometric Shapes */}
        <Animated.View 
          style={[
            styles.geometricShape1,
            {
              transform: [
                {
                  rotateX: backgroundRotateX.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  rotateY: geometryAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, 500],
                    outputRange: [0, -100],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }
          ]}
        >
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            style={styles.backgroundGradient}
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.geometricShape2,
            {
              transform: [
                {
                  rotateY: backgroundRotateY.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  rotateZ: geometryAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '270deg'],
                  }),
                },
                {
                  translateX: scrollY.interpolate({
                    inputRange: [0, 300],
                    outputRange: [0, 50],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }
          ]}
        >
          <LinearGradient
            colors={['#FF9999', '#FF6B6B']}
            style={styles.backgroundGradient}
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.geometricShape3,
            {
              transform: [
                {
                  rotateZ: backgroundRotateZ.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  rotateX: geometryAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, 400],
                    outputRange: [0, 80],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }
          ]}
        >
          <LinearGradient
            colors={['#FFE066', '#FFCC02']}
            style={styles.backgroundGradient}
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.geometricShape4,
            {
              transform: [
                {
                  rotateX: perspectiveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  rotateY: geometryAnim4.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  scale: depthAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.2, 1],
                  }),
                },
              ],
            }
          ]}
        >
          <LinearGradient
            colors={['#95E1A3', '#6BCF7F']}
            style={styles.backgroundGradient}
          />
        </Animated.View>

        {/* Floating Orbs */}
        <Animated.View 
          style={[
            styles.floatingOrb1,
            {
              opacity: floatingOrb1.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.4, 0.8, 0.4],
              }),
              transform: [
                {
                  translateY: floatingOrb1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -150],
                  }),
                },
                {
                  translateX: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 30],
                  }),
                },
                {
                  scale: floatingOrb1.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.3, 1],
                  }),
                },
              ],
            }
          ]}
        />

        <Animated.View 
          style={[
            styles.floatingOrb2,
            {
              opacity: floatingOrb2.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 0.7, 0.3],
              }),
              transform: [
                {
                  translateY: floatingOrb2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -200],
                  }),
                },
                {
                  translateX: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, -20],
                  }),
                },
                {
                  scale: floatingOrb2.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.2, 1],
                  }),
                },
              ],
            }
          ]}
        />

        <Animated.View 
          style={[
            styles.floatingOrb3,
            {
              opacity: floatingOrb3.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.2, 0.6, 0.2],
              }),
              transform: [
                {
                  translateY: floatingOrb3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -180],
                  }),
                },
                {
                  rotate: floatingOrb3.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  scale: floatingOrb3.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.4, 1],
                  }),
                },
              ],
            }
          ]}
        />

        {/* Additional Background Elements */}
        <Animated.View 
          style={[
            styles.additionalShape1,
            {
              opacity: perspectiveAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.1, 0.3, 0.1],
              }),
              transform: [
                {
                  rotateX: perspectiveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  rotateZ: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            }
          ]}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.backgroundGradient}
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.additionalShape2,
            {
              opacity: depthAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.15, 0.4, 0.15],
              }),
              transform: [
                {
                  rotateY: depthAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  scale: waveAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.1, 1],
                  }),
                },
              ],
            }
          ]}
        >
          <LinearGradient
            colors={['#A8E6CF', '#88D8A3']}
            style={styles.backgroundGradient}
          />
        </Animated.View>
      </View>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Enhanced Header with Productivity Dashboard */}
        <View style={[styles.header, { paddingTop: safeAreaInsets.top }]}>
          <View style={styles.headerLeft}>
            <Animated.View 
              style={[
                styles.greetingSection,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              {/* Enhanced Greeting Card */}
              <View style={styles.greetingCard}>
                <LinearGradient
                  colors={greetingData.gradient as [string, string]}
                  style={styles.greetingGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Decorative Background Elements */}
                  <Animated.View 
                    style={[
                      styles.decorativeCircle1,
                      {
                        transform: [{
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        }],
                      }
                    ]}
                  />
                  <Animated.View 
                    style={[
                      styles.decorativeCircle2,
                      {
                        transform: [{
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['360deg', '0deg'],
                          }),
                        }],
                      }
                    ]}
                  />
                  
                  {/* Additional decorative elements */}
                  <View style={styles.decorativeCircle3} />
                  <View style={styles.decorativeCircle4} />
                  
                  {/* Top wave decoration */}
                  <View style={styles.topWave} />
                  <View style={styles.bottomWave} />
                  
                  {/* Floating particles */}
                  <Animated.View 
                    style={[
                      styles.particle1,
                      {
                        opacity: particleAnim1.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1, 0],
                        }),
                        transform: [{
                          translateY: particleAnim1.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, -30],
                          }),
                        }],
                      }
                    ]}
                  />
                  <Animated.View 
                    style={[
                      styles.particle2,
                      {
                        opacity: particleAnim2.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 0.8, 0],
                        }),
                        transform: [{
                          translateY: particleAnim2.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, -40],
                          }),
                        }],
                      }
                    ]}
                  />
                  <Animated.View 
                    style={[
                      styles.particle3,
                      {
                        opacity: particleAnim3.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 0.6, 0],
                        }),
                        transform: [{
                          translateY: particleAnim3.interpolate({
                            inputRange: [0, 1],
                            outputRange: [15, -35],
                          }),
                        }],
                      }
                    ]}
                  />
                  
                  {/* Animated Emoji */}
                  <Animated.Text 
                    style={[
                      styles.greetingEmoji,
                      {
                        transform: [{ scale: pulseAnim }]
                      }
                    ]}
                  >
                    {greetingData.emoji}
                  </Animated.Text>
                  
                  {/* Main Greeting Text with Shimmer */}
                  <Animated.View style={styles.greetingTextContainer}>
                    <Text style={styles.greetingMainText}>
                      {greetingData.text}
                    </Text>
                    <Animated.View 
                      style={[
                        styles.shimmerOverlay,
                        {
                          opacity: shimmerAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0, 0.7, 0],
                          }),
                          transform: [{
                            translateX: shimmerAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-100, 100],
                            }),
                          }],
                        }
                      ]}
                    />
                  </Animated.View>
                  
                  {/* Subtitle */}
                  <Text style={styles.greetingSubtitle}>
                    {greetingData.subtitle}
                  </Text>
                  
                  {/* Date with enhanced styling */}
                  <View style={styles.dateChip}>
                    <MaterialIcons name="today" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.dateChipText}>
                      {dateInfo.dayOfWeek}, {dateInfo.date}
                    </Text>
                  </View>
                  
                  {/* Productivity Preview Badge */}
                  <View style={styles.productivityPreview}>
                    <MaterialIcons 
                      name={productivityStatus.icon as any} 
                      size={16} 
                      color="rgba(255,255,255,0.9)" 
                    />
                    <Text style={styles.productivityPreviewText}>
                      {todayCompletionPercentage}% Complete
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>
            
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, styles.firstSection]}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionCard, user?.preferences.theme === 'dark' && styles.darkCard]}
                onPress={action.onPress}
              >
                <LinearGradient
                  colors={[action.color, `${action.color}80`]}
                  style={styles.quickActionGradient}
                >
                  <MaterialIcons 
                    name={action.icon as any} 
                    size={28} 
                    color="white" 
                  />
                  <Text style={styles.quickActionText}>
                    {action.title}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            {statsCards.map((stat, index) => (
              <View key={index} style={[styles.statCard, user?.preferences.theme === 'dark' && styles.darkCard]}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <MaterialIcons 
                    name={stat.icon as any} 
                    size={24} 
                    color={stat.color} 
                  />
                </View>
                <Text style={[styles.statValue, user?.preferences.theme === 'dark' && styles.darkText]}>
                  {stat.value}
                  <Text style={[styles.statTotal, user?.preferences.theme === 'dark' && styles.darkSubText]}>/{stat.total}</Text>
                </Text>
                <Text style={[styles.statTitle, user?.preferences.theme === 'dark' && styles.darkSubText]}>{stat.title}</Text>
                {/* Progress bar */}
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${stat.total > 0 ? (stat.value / stat.total) * 100 : 0}%`,
                        backgroundColor: stat.color 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Productivity Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Productivity Insights</Text>
          <Animated.View 
            style={[
              styles.insightCard,
              user?.preferences.theme === 'dark' && styles.darkCard,
              {
                opacity: insightAnim,
                transform: [
                  {
                    translateY: insightAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [15, 0], // Reduced from 30 to 15
                    }),
                  },
                  {
                    scale: insightAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1], // Reduced from 0.9 to 0.95
                    }),
                  },
                ],
              }
            ]}
          >
            <LinearGradient
              colors={['#FF9800', '#FF9800CC']}
              style={styles.insightGradient}
            >
              <View style={styles.insightHeader}>
                <MaterialIcons 
                  name={productivityStatus.icon as any} 
                  size={32} 
                  color="white" 
                />
                <Text style={styles.insightTitle}>
                  {productivityStatus.text}
                </Text>
              </View>
              <Text style={styles.insightPercentage}>
                {todayCompletionPercentage}% Complete
              </Text>
              <Text style={styles.insightMessage}>
                {productivityStatus.message}
              </Text>
              <View style={styles.insightStats}>
                <View style={styles.insightStatItem}>
                  <Text style={styles.insightStatValue}>{completedToday}</Text>
                  <Text style={styles.insightStatLabel}>Completed</Text>
                </View>
                <View style={styles.insightStatItem}>
                  <Text style={styles.insightStatValue}>{Math.max(0, totalPossibleToday - completedToday)}</Text>
                  <Text style={styles.insightStatLabel}>Remaining</Text>
                </View>
                <View style={styles.insightStatItem}>
                  <Text style={styles.insightStatValue}>{currentStreak}</Text>
                  <Text style={styles.insightStatLabel}>Best Streak</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Dynamic Motivational Quote */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#4ECDC4', '#44B5AC']}
            style={styles.quoteCard}
          >
            <View style={styles.quoteHeader}>
              <MaterialIcons name="format-quote" size={32} color="white" />
              <Text style={styles.quoteBadge}>Daily Inspiration</Text>
            </View>
            <Text style={styles.quoteText}>
              "{motivationalQuote.text}"
            </Text>
            <Text style={styles.quoteAuthor}>- {motivationalQuote.author}</Text>
          </LinearGradient>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0, // Remove horizontal padding to extend card
    paddingVertical: 0, // Remove vertical padding
    paddingBottom: 20,
    overflow: 'hidden',
  },
  headerLeft: {
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%', // Full width
  },
  greetingSection: {
    marginBottom: 0, // Remove bottom margin
    width: '100%',
    alignItems: 'center',
  },
  greetingCard: {
    width: '100%',
    borderRadius: 0, // Remove border radius for full coverage
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginHorizontal: 0, // Ensure no margins
  },
  greetingGradient: {
    padding: 24,
    paddingVertical: 40, // Increased vertical padding
    paddingTop: 60, // Extra top padding to account for safe area
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200, // Minimum height for better coverage
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200, // Increased size
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -60, // Adjusted position
    right: -60,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150, // Increased size
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -40, // Adjusted position
    left: -40,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: 20,
    left: -30,
  },
  decorativeCircle4: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    bottom: 50,
    right: 20,
  },
  topWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  particle1: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    top: '30%',
    left: '20%',
  },
  particle2: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    top: '50%',
    right: '25%',
  },
  particle3: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: '70%',
    left: '70%',
  },
  greetingEmoji: {
    fontSize: 48,
    marginBottom: 16,
    textAlign: 'center',
  },
  greetingTextContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
  },
  greetingMainText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    gap: 6,
  },
  dateChipText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  productivityPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  productivityPreviewText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  greeting: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 4,
    fontWeight: '500',
    textAlign: 'center', // Center the greeting text
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
    flexShrink: 1, // Allow text to shrink if needed
    flexWrap: 'wrap', // Allow text wrapping
    textAlign: 'center', // Center the user name
  },
  dateDisplay: {
    fontSize: 14,
    color: '#95A5A6',
    fontWeight: '500',
    textAlign: 'center', // Center the date
  },
  insightsSection: {
    gap: 12,
  },
  productivityCard: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productivityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  percentageText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  motivationalMessage: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  streakText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  motivationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  motivationText: {
    fontSize: 12,
    color: '#FFC107',
    fontWeight: '600',
  },
  headerRight: {
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  dateContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 50,
  },
  dayText: {
    fontSize: 10,
    color: '#95A5A6',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  headerContent: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  firstSection: {
    marginTop: 20, // Add some top margin after the full-width greeting
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statTotal: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#7F8C8D',
  },
  statTitle: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  insightCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  insightGradient: {
    padding: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  insightPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  insightMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 20,
  },
  insightStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  insightStatItem: {
    alignItems: 'center',
  },
  insightStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  insightStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  quoteCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quoteBadge: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quoteText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  quoteAuthor: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Enhanced 3D Background Styles
  background3D: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: 'hidden',
  },
  backgroundGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  geometricShape1: {
    position: 'absolute',
    width: 140,
    height: 140,
    top: '15%',
    right: '10%',
    borderRadius: 25,
    opacity: 0.4,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },
  geometricShape2: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: '35%',
    left: '5%',
    borderRadius: 50,
    opacity: 0.35,
    shadowColor: '#FF9999',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  geometricShape3: {
    position: 'absolute',
    width: 120,
    height: 120,
    top: '60%',
    right: '15%',
    borderRadius: 60,
    opacity: 0.3,
    shadowColor: '#FFE066',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 18,
  },
  geometricShape4: {
    position: 'absolute',
    width: 80,
    height: 80,
    top: '80%',
    left: '20%',
    borderRadius: 40,
    opacity: 0.25,
    shadowColor: '#95E1A3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 22,
    elevation: 10,
  },
  floatingOrb1: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(78, 205, 196, 0.6)',
    top: '25%',
    left: '25%',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 12,
  },
  floatingOrb2: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 153, 153, 0.55)',
    top: '45%',
    right: '30%',
    shadowColor: '#FF9999',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  floatingOrb3: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 224, 102, 0.5)',
    top: '70%',
    left: '70%',
    shadowColor: '#FFE066',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  additionalShape1: {
    position: 'absolute',
    width: 90,
    height: 90,
    top: '5%',
    left: '70%',
    borderRadius: 45,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  additionalShape2: {
    position: 'absolute',
    width: 110,
    height: 110,
    top: '85%',
    right: '5%',
    borderRadius: 20,
    shadowColor: '#A8E6CF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  
  // Dark Mode Styles
  darkContainer: {
    backgroundColor: '#1A1A1A',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubText: {
    color: '#CCCCCC',
  },
  darkCard: {
    backgroundColor: '#2A2A2A',
  },
  darkBorder: {
    borderColor: '#3A3A3A',
  },
});

export default HomeScreen;