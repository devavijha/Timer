import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Dimensions } from 'react-native';
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
  
  // Essential animation values only (reduced from 24+ to 5)
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-20))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const progressAnim = useState(new Animated.Value(0))[0];
  
  // Use auth context instead of Redux for user state
  const { userProfile } = useAuth();
  
  // Use typed selectors with memoization
  const { habits } = useAppSelector((state) => state.habits);
  const { categories } = useAppSelector((state) => state.tasks);
  const { goals } = useAppSelector((state) => state.goals);
  const { sessions } = useAppSelector((state) => state.meditation);
  
  // Get user preferences for dark mode
  const { user } = useAppSelector((state) => state.user);

  // Memoized calculations to prevent unnecessary re-renders
  const stats = useMemo(() => {
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

    const currentStreak = habits?.reduce((maxStreak, habit) => {
      return Math.max(maxStreak, habit.streak || 0);
    }, 0) || 0;

    const totalHabitsToday = habits?.length || 0;
    const totalTasksToday = categories?.reduce((sum, cat) => 
      sum + (cat.tasks?.length || 0), 0) || 0;
    const totalPossibleToday = totalHabitsToday + totalTasksToday;
    const completedToday = completedHabitsToday + completedTasks;
    const todayCompletionPercentage = totalPossibleToday > 0 ? Math.round((completedToday / totalPossibleToday) * 100) : 0;

    const todayActivityScore = completedHabitsToday + completedTasks + (goals?.filter(goal => goal.progress > 0).length || 0);

    return {
      completedHabitsToday,
      totalTasks,
      completedTasks,
      activeGoals,
      completedSessions,
      currentStreak,
      todayCompletionPercentage,
      todayActivityScore
    };
  }, [habits, categories, goals, sessions]);

  // Dynamic greeting based on time with elegant messages
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.name || 'Champion';
    
    if (hour < 6) return { 
      text: `Sweet Dreams, ${name}`, 
      emoji: '🌙', 
      subtitle: 'Rest well, tomorrow awaits your greatness',
      gradient: ['#2D3748', '#4A5568', '#1A202C'],
      accent: '#6366F1'
    };
    if (hour < 12) return { 
      text: `Good Morning, ${name}`, 
      emoji: '🌲☀️🌲', 
      subtitle: 'Today is your canvas to create magic',
      gradient: ['#FED7D7', '#FEB2B2', '#FC8181'],
      accent: '#F56565'
    };
    if (hour < 17) return { 
      text: `Hello, ${name}`, 
      emoji: '✨', 
      subtitle: 'You\'re creating something beautiful today',
      gradient: ['#BEE3F8', '#90CDF4', '#63B3ED'],
      accent: '#3182CE'
    };
    if (hour < 21) return { 
      text: `Good Evening, ${name}`, 
      emoji: '🌞', 
      subtitle: 'Reflect on the masterpiece you\'ve built',
      gradient: ['#FAF5FF', '#E9D8FD', '#D6BCFA'],
      accent: '#9F7AEA'
    };
    return { 
      text: `Good Night, ${name}`, 
      emoji: '🌟', 
      subtitle: 'Tomorrow holds infinite possibilities',
      gradient: ['#2D3748', '#4A5568', '#1A202C'],
      accent: '#68D391'
    };
  };

  // Enhanced productivity status with motivational messages
  const getProductivityStatus = () => {
    if (stats.todayCompletionPercentage >= 80) return { 
      text: 'On Fire', 
      icon: 'local-fire-department', 
      color: '#EF4444',
      message: 'You\'re crushing it today! 🔥'
    };
    if (stats.todayCompletionPercentage >= 60) return { 
      text: 'Great Progress', 
      icon: 'trending-up', 
      color: '#10B981',
      message: 'Keep up the excellent work! 📈'
    };
    if (stats.todayCompletionPercentage >= 40) return { 
      text: 'Making Progress', 
      icon: 'timeline', 
      color: '#F59E0B',
      message: 'Steady progress wins the race! 📊'
    };
    if (stats.todayCompletionPercentage > 0) return { 
      text: 'Getting Started', 
      icon: 'play-arrow', 
      color: '#3B82F6',
      message: 'Great start! Keep building momentum! ▶️'
    };
    return { 
      text: 'Ready to Begin', 
      icon: 'wb-sunny', 
      color: '#F59E0B',
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

  // Daily Challenges System with XP motivation - Memoized for proper updates
  const getDailyChallenges = useMemo(() => {
    const challenges = [
      {
        title: "Complete 3 Tasks",
        description: "Finish 3 tasks to boost your productivity streak",
        icon: "assignment-turned-in",
        xp: 50,
        gradient: ["#667eea", "#764ba2"],
        current: stats.completedTasks,
        target: 3,
        progress: Math.min((stats.completedTasks / 3) * 100, 100),
        progressColor: "#4ADE80",
        difficulty: "Easy",
        onPress: () => navigation.navigate('Tasks' as never)
      },
      {
        title: "Track 2 Habits",
        description: "Maintain your habit streak for today",
        icon: "track-changes",
        xp: 75,
        gradient: ["#f093fb", "#f5576c"],
        current: stats.completedHabitsToday,
        target: 2,
        progress: Math.min((stats.completedHabitsToday / 2) * 100, 100),
        progressColor: "#F59E0B",
        difficulty: "Medium",
        onPress: () => navigation.navigate('Habits' as never)
      },
      {
        title: "Meditate for 10 min",
        description: "Find your inner peace with a meditation session",
        icon: "spa",
        xp: 100,
        gradient: ["#4facfe", "#00f2fe"],
        current: stats.completedSessions > 0 ? 1 : 0,
        target: 1,
        progress: stats.completedSessions > 0 ? 100 : 0,
        progressColor: "#10B981",
        difficulty: "Hard",
        onPress: () => navigation.navigate('Meditation' as never)
      }
    ];

    // Filter to show only incomplete challenges or add a "bonus" challenge if all are complete
    const incompleteChallenges = challenges.filter(c => c.progress < 100);
    
    if (incompleteChallenges.length === 0) {
      // All challenges completed - show bonus challenge
      return [{
        title: "Daily Master!",
        description: "You've completed all challenges! Take a moment to celebrate 🎉",
        icon: "emoji-events",
        xp: 200,
        gradient: ["#ffecd2", "#fcb69f"],
        current: 1,
        target: 1,
        progress: 100,
        progressColor: "#FFD700",
        difficulty: "Legendary",
        onPress: () => {}
      }];
    }

    return incompleteChallenges.slice(0, 2); // Show max 2 challenges
  }, [stats.completedTasks, stats.completedHabitsToday, stats.completedSessions, navigation]);

  // Calculate total XP earned from all challenges (not just visible ones)
  const dailyChallengesXPEarned = useMemo(() => {
    const allChallenges = [
      {
        progress: Math.min((stats.completedTasks / 3) * 100, 100),
        xp: 50
      },
      {
        progress: Math.min((stats.completedHabitsToday / 2) * 100, 100),
        xp: 75
      },
      {
        progress: stats.completedSessions > 0 ? 100 : 0,
        xp: 100
      }
    ];

    const baseXP = allChallenges.reduce((total, challenge) => {
      return total + (challenge.progress >= 100 ? challenge.xp : 0);
    }, 0);
    
    // Add bonus XP if all challenges are completed
    const bonusXP = allChallenges.every(c => c.progress >= 100) ? 200 : 0;
    
    return baseXP + bonusXP;
  }, [stats.completedTasks, stats.completedHabitsToday, stats.completedSessions]);

  // Calculate remaining XP that can be earned
  const dailyChallengesXPRemaining = useMemo(() => {
    const allChallenges = [
      {
        progress: Math.min((stats.completedTasks / 3) * 100, 100),
        xp: 50
      },
      {
        progress: Math.min((stats.completedHabitsToday / 2) * 100, 100),
        xp: 75
      },
      {
        progress: stats.completedSessions > 0 ? 100 : 0,
        xp: 100
      }
    ];

    const remainingXP = allChallenges.reduce((total, challenge) => {
      return total + (challenge.progress < 100 ? challenge.xp : 0);
    }, 0);
    
    // Add bonus XP if not all challenges are completed yet
    const bonusXP = allChallenges.every(c => c.progress >= 100) ? 0 : 200;
    
    return remainingXP + bonusXP;
  }, [stats.completedTasks, stats.completedHabitsToday, stats.completedSessions]);

  // XP and Level System - Updated to use memoized challenges
  const getXPProgress = useMemo(() => {
    // Use the memoized daily XP calculation
    const totalDailyXP = dailyChallengesXPEarned;
    
    // Simulate total XP (in real app, this would come from user's profile)
    const totalXP = totalDailyXP + (stats.currentStreak * 25) + (stats.completedTasks * 10) + (stats.completedHabitsToday * 15);
    
    // Level calculation
    const level = Math.floor(totalXP / 500) + 1;
    const currentLevelXP = totalXP % 500;
    const nextLevelXP = 500;
    const progressToNextLevel = (currentLevelXP / nextLevelXP) * 100;
    
    return {
      totalXP,
      level,
      currentLevelXP,
      nextLevelXP,
      progressToNextLevel,
      dailyXP: totalDailyXP
    };
  }, [dailyChallengesXPEarned, stats.currentStreak, stats.completedTasks, stats.completedHabitsToday]);

  // Enhanced Achievement Badges System
  const getAchievements = () => {
    const xpProgress = getXPProgress;
    const achievements: Array<{
      icon: string;
      title: string;
      description: string;
      color: string;
      earned: boolean;
      progress?: number;
      category: 'level' | 'streak' | 'tasks' | 'habits' | 'meditation' | 'special';
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
      xpReward: number;
    }> = [];

    // Level-based achievements
    achievements.push({
      icon: "star",
      title: "Rising Star",
      description: "Reach Level 5",
      color: "#FFD700",
      earned: xpProgress.level >= 5,
      progress: Math.min((xpProgress.level / 5) * 100, 100),
      category: 'level',
      rarity: 'rare',
      xpReward: 100
    });

    achievements.push({
      icon: "diamond",
      title: "Productivity Pro",
      description: "Reach Level 10",
      color: "#9333EA",
      earned: xpProgress.level >= 10,
      progress: Math.min((xpProgress.level / 10) * 100, 100),
      category: 'level',
      rarity: 'epic',
      xpReward: 250
    });

    // Streak achievements
    achievements.push({
      icon: "local-fire-department",
      title: "Week Warrior",
      description: "Maintain 7-day streak",
      color: "#EF4444",
      earned: stats.currentStreak >= 7,
      progress: Math.min((stats.currentStreak / 7) * 100, 100),
      category: 'streak',
      rarity: 'rare',
      xpReward: 150
    });

    achievements.push({
      icon: "whatshot",
      title: "Streak Master",
      description: "Maintain 30-day streak",
      color: "#DC2626",
      earned: stats.currentStreak >= 30,
      progress: Math.min((stats.currentStreak / 30) * 100, 100),
      category: 'streak',
      rarity: 'legendary',
      xpReward: 500
    });

    // Task completion achievements
    achievements.push({
      icon: "check-circle",
      title: "Task Rookie",
      description: "Complete 10 tasks",
      color: "#3B82F6",
      earned: stats.completedTasks >= 10,
      progress: Math.min((stats.completedTasks / 10) * 100, 100),
      category: 'tasks',
      rarity: 'common',
      xpReward: 50
    });

    achievements.push({
      icon: "assignment-turned-in",
      title: "Task Master",
      description: "Complete 50 tasks",
      color: "#1D4ED8",
      earned: stats.completedTasks >= 50,
      progress: Math.min((stats.completedTasks / 50) * 100, 100),
      category: 'tasks',
      rarity: 'epic',
      xpReward: 200
    });

    // Habit tracking achievements
    achievements.push({
      icon: "track-changes",
      title: "Habit Builder",
      description: "Track 5 habits today",
      color: "#10B981",
      earned: stats.completedHabitsToday >= 5,
      progress: Math.min((stats.completedHabitsToday / 5) * 100, 100),
      category: 'habits',
      rarity: 'rare',
      xpReward: 75
    });

    // Meditation achievements
    achievements.push({
      icon: "spa",
      title: "Zen Master",
      description: "Complete 20 meditation sessions",
      color: "#06B6D4",
      earned: stats.completedSessions >= 20,
      progress: Math.min((stats.completedSessions / 20) * 100, 100),
      category: 'meditation',
      rarity: 'epic',
      xpReward: 300
    });

    // Special achievements
    if (stats.todayCompletionPercentage === 100) {
      achievements.push({
        icon: "emoji-events",
        title: "Perfect Day",
        description: "100% completion today",
        color: "#FFD700",
        earned: true,
        progress: 100,
        category: 'special',
        rarity: 'legendary',
        xpReward: 400
      });
    }

    // Early Bird achievement (if it's morning and user has activity)
    const hour = new Date().getHours();
    if (hour < 9 && (stats.completedTasks > 0 || stats.completedHabitsToday > 0)) {
      achievements.push({
        icon: "wb-sunny",
        title: "Early Bird",
        description: "Active before 9 AM",
        color: "#F97316",
        earned: true,
        progress: 100,
        category: 'special',
        rarity: 'rare',
        xpReward: 100
      });
    }

    // Sort by: earned first, then by rarity, then by progress
    const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
    return achievements.sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      if (a.rarity !== b.rarity) return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      return (b.progress || 0) - (a.progress || 0);
    });
  };

  // Simplified and optimized animation setup
  useEffect(() => {
    // Main entrance animations only - no complex background animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Simple pulse animation for emoji
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim, slideAnim, scaleAnim, pulseAnim, progressAnim]);

  const quickActions = [
    {
      title: 'Add Task',
      icon: 'add-task',
      color: '#3B82F6',
      onPress: () => navigation.navigate('Tasks' as never),
    },
    {
      title: 'Track Habit',
      icon: 'track-changes',
      color: '#EF4444',
      onPress: () => navigation.navigate('Habits' as never),
    },
    {
      title: 'Meditate',
      icon: 'self-improvement',
      color: '#10B981',
      onPress: () => navigation.navigate('Meditation' as never),
    },
    {
      title: 'Set Goal',
      icon: 'flag',
      color: '#F59E0B',
      onPress: () => navigation.navigate('Progress' as never),
    },
  ];

  const statsCards = [
    {
      title: 'Tasks Completed',
      value: stats.completedTasks,
      total: stats.totalTasks,
      color: '#3B82F6',
      icon: 'task-alt',
    },
    {
      title: 'Habits Tracked',
      value: stats.completedHabitsToday,
      total: habits?.length || 0,
      color: '#EF4444',
      icon: 'track-changes',
    },
    {
      title: 'Active Goals',
      value: stats.activeGoals,
      total: goals?.length || 0,
      color: '#F59E0B',
      icon: 'flag',
    },
    {
      title: 'Meditation Sessions',
      value: stats.completedSessions,
      total: sessions?.length || 0,
      color: '#10B981',
      icon: 'spa',
    },
  ];  return (
    <SafeAreaView style={[styles.container, user?.preferences.theme === 'dark' && styles.darkContainer, { paddingTop: safeAreaInsets.top, paddingBottom: safeAreaInsets.bottom }]}> 
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Quick Actions with Enhanced Cards */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.enhancedQuickActionCard, user?.preferences.theme === 'dark' && styles.darkCard]}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[action.color, `${action.color}90`]}
                  style={styles.quickActionIconContainer}
                >
                  <MaterialIcons name={action.icon as any} size={28} color="white" />
                </LinearGradient>
                <Text style={[styles.enhancedQuickActionText, user?.preferences.theme === 'dark' && styles.darkText]}>
                  {action.title}
                </Text>
                <View style={[styles.quickActionAccent, { backgroundColor: action.color }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Enhanced Stats Grid with Refined Design */}
        <View style={styles.section}>
          <View style={styles.progressSectionHeader}>
            <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Today's Progress</Text>
            <View style={styles.progressOverallBadge}>
              <Text style={styles.progressOverallText}>{stats.todayCompletionPercentage}% Complete</Text>
            </View>
          </View>
          
          <View style={styles.enhancedStatsGrid}>
            {statsCards.map((stat, index) => (
              <View key={index} style={[styles.refinedStatCard, user?.preferences.theme === 'dark' && styles.darkCard]}>
                {/* Card Background Gradient */}
                <LinearGradient
                  colors={[`${stat.color}08`, `${stat.color}03`]}
                  style={styles.statCardBackground}
                />
                
                {/* Floating Elements */}
                <View style={styles.statCardFloatingElements}>
                  <View style={[styles.statFloatingDot, { backgroundColor: `${stat.color}20` }]} />
                  <View style={[styles.statFloatingRing, { borderColor: `${stat.color}15` }]} />
                </View>
                
                <View style={styles.refinedStatCardContent}>
                  {/* Icon with Enhanced Design */}
                  <View style={styles.refinedStatIconContainer}>
                    <LinearGradient
                      colors={[stat.color, `${stat.color}90`]}
                      style={styles.refinedStatIcon}
                    >
                      <MaterialIcons name={stat.icon as any} size={24} color="white" />
                    </LinearGradient>
                    <View style={[styles.statIconGlow, { backgroundColor: `${stat.color}30` }]} />
                  </View>
                  
                  {/* Enhanced Progress Circle */}
                  <View style={styles.refinedProgressContainer}>
                    <View style={styles.refinedProgressRing}>
                      <View style={[styles.refinedProgressRingBackground, { borderColor: `${stat.color}15` }]} />
                      <View 
                        style={[
                          styles.refinedProgressRingFill, 
                          { 
                            borderColor: stat.color,
                            transform: [{ 
                              rotate: `${Math.min((stat.total > 0 ? (stat.value / stat.total) * 270 : 0), 270)}deg` 
                            }]
                          }
                        ]} 
                      />
                      <View style={styles.refinedProgressCenter}>
                        <Text style={[styles.refinedProgressPercentage, { color: stat.color }]}>
                          {stat.total > 0 ? Math.round((stat.value / stat.total) * 100) : 0}%
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Values with Enhanced Typography */}
                  <View style={styles.refinedStatValues}>
                    <Text style={[styles.refinedStatValue, user?.preferences.theme === 'dark' && styles.darkText]}>
                      {stat.value}
                      <Text style={[styles.refinedStatTotal, user?.preferences.theme === 'dark' && styles.darkSubText]}>
                        /{stat.total}
                      </Text>
                    </Text>
                    <Text style={[styles.refinedStatTitle, user?.preferences.theme === 'dark' && styles.darkSubText]}>
                      {stat.title}
                    </Text>
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={styles.refinedProgressBar}>
                    <View style={[styles.refinedProgressBarBackground, { backgroundColor: `${stat.color}10` }]}>
                      <Animated.View 
                        style={[
                          styles.refinedProgressBarFill, 
                          { 
                            backgroundColor: stat.color,
                            width: progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', `${stat.total > 0 ? (stat.value / stat.total) * 100 : 0}%`]
                            })
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  
                  {/* Status Badge */}
                  <View style={styles.refinedStatStatus}>
                    {stat.total > 0 && stat.value === stat.total ? (
                      <View style={[styles.refinedStatusBadge, { backgroundColor: `${stat.color}20` }]}>
                        <MaterialIcons name="check-circle" size={14} color={stat.color} />
                        <Text style={[styles.refinedStatusText, { color: stat.color }]}>Complete</Text>
                      </View>
                    ) : stat.value > 0 ? (
                      <View style={[styles.refinedStatusBadge, { backgroundColor: `${stat.color}15` }]}>
                        <MaterialIcons name="trending-up" size={14} color={stat.color} />
                        <Text style={[styles.refinedStatusText, { color: stat.color }]}>In Progress</Text>
                      </View>
                    ) : (
                      <View style={[styles.refinedStatusBadge, { backgroundColor: '#F3F4F620' }]}>
                        <MaterialIcons name="schedule" size={14} color="#94A3B8" />
                        <Text style={[styles.refinedStatusText, { color: '#94A3B8' }]}>Pending</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Enhanced Productivity Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Productivity Insights</Text>
          <View style={[styles.enhancedInsightCard, user?.preferences.theme === 'dark' && styles.darkCard]}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.enhancedInsightGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Background Pattern */}
              <View style={styles.insightPattern}>
                <View style={[styles.patternCircle, styles.patternCircle1]} />
                <View style={[styles.patternCircle, styles.patternCircle2]} />
                <View style={[styles.patternCircle, styles.patternCircle3]} />
              </View>
              
              <View style={styles.enhancedInsightHeader}>
                <View style={styles.insightIconContainer}>
                  <MaterialIcons name={productivityStatus.icon as any} size={36} color="white" />
                </View>
                <View style={styles.insightTitleContainer}>
                  <Text style={styles.enhancedInsightTitle}>{productivityStatus.text}</Text>
                  <Text style={styles.insightSubtitle}>Keep up the momentum!</Text>
                </View>
              </View>
              
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircle}>
                  <Text style={styles.enhancedInsightPercentage}>{stats.todayCompletionPercentage}%</Text>
                  <Text style={styles.progressCircleLabel}>Complete</Text>
                </View>
              </View>
              
              <Text style={styles.enhancedInsightMessage}>{productivityStatus.message}</Text>
              
              <View style={styles.enhancedInsightStats}>
                <View style={styles.enhancedInsightStatItem}>
                  <Text style={styles.enhancedInsightStatValue}>{stats.completedHabitsToday + stats.completedTasks}</Text>
                  <Text style={styles.enhancedInsightStatLabel}>Completed</Text>
                </View>
                <View style={[styles.enhancedInsightStatItem, styles.middleStat]}>
                  <Text style={styles.enhancedInsightStatValue}>{Math.max(0, (habits?.length || 0) + stats.totalTasks - stats.completedHabitsToday - stats.completedTasks)}</Text>
                  <Text style={styles.enhancedInsightStatLabel}>Remaining</Text>
                </View>
                <View style={styles.enhancedInsightStatItem}>
                  <Text style={styles.enhancedInsightStatValue}>{stats.currentStreak}</Text>
                  <Text style={styles.enhancedInsightStatLabel}>Best Streak</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* XP Progress & Achievement System */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Level Progress</Text>
          <View style={[styles.xpProgressCard, user?.preferences.theme === 'dark' && styles.darkCard]}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.xpProgressGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* XP Background Pattern */}
              <View style={styles.xpBackgroundPattern}>
                <View style={[styles.xpPatternElement, styles.xpPattern1]} />
                <View style={[styles.xpPatternElement, styles.xpPattern2]} />
                <View style={[styles.xpPatternElement, styles.xpPattern3]} />
              </View>
              
              <View style={styles.xpProgressContent}>
                {/* Level Display */}
                <View style={styles.xpLevelContainer}>
                  <View style={styles.xpLevelBadge}>
                    <MaterialIcons name="star" size={24} color="#FFD700" />
                    <Text style={styles.xpLevelText}>LEVEL {getXPProgress.level}</Text>
                  </View>
                  <Text style={styles.xpTotalText}>{getXPProgress.totalXP} XP Total</Text>
                </View>
                
                {/* Progress to Next Level */}
                <View style={styles.xpProgressContainer}>
                  <View style={styles.xpProgressHeader}>
                    <Text style={styles.xpProgressLabel}>Progress to Level {getXPProgress.level + 1}</Text>
                    <Text style={styles.xpProgressNumbers}>
                      {getXPProgress.currentLevelXP}/{getXPProgress.nextLevelXP} XP
                    </Text>
                  </View>
                  <View style={styles.xpProgressBar}>
                    <View 
                      style={[
                        styles.xpProgressFill, 
                        { width: `${getXPProgress.progressToNextLevel}%` }
                      ]} 
                    />
                    <View style={styles.xpProgressGlow} />
                  </View>
                </View>
                
                {/* Daily XP Earned */}
                <View style={styles.xpDailyContainer}>
                  <View style={styles.xpDailyBadge}>
                    <MaterialIcons name="today" size={16} color="#4ADE80" />
                    <Text style={styles.xpDailyText}>+{getXPProgress.dailyXP} XP Today</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
          
          {/* Revamped Achievement System */}
          <View style={styles.achievementsContainer}>
            {/* Simple Header */}
            <View style={styles.revampedAchievementsHeader}>
              <View style={styles.achievementsHeaderLeft}>
                <View style={styles.achievementsTitleContainer}>
                  <MaterialIcons name="emoji-events" size={28} color="#FFD700" />
                  <Text style={[styles.revampedAchievementsTitle, user?.preferences.theme === 'dark' && styles.darkText]}>
                    Achievements
                  </Text>
                </View>
                <Text style={[styles.achievementsSubtitle, user?.preferences.theme === 'dark' && styles.darkSubText]}>
                  Unlock your potential, one achievement at a time
                </Text>
              </View>
            </View>
            
            {/* Revamped Achievements Grid */}
            <View style={styles.revampedAchievementsGrid}>
              {getAchievements().slice(0, 6).map((achievement, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.revampedAchievementCard,
                    achievement.earned && styles.revampedAchievementCardEarned,
                    !achievement.earned && styles.revampedAchievementCardInactive,
                    achievement.rarity === 'legendary' && styles.revampedAchievementLegendary,
                    achievement.rarity === 'epic' && styles.revampedAchievementEpic,
                    achievement.rarity === 'rare' && styles.revampedAchievementRare,
                    achievement.rarity === 'common' && styles.revampedAchievementCommon,
                    user?.preferences.theme === 'dark' && styles.darkCard,
                    user?.preferences.theme === 'dark' && styles.darkAchievementBadge,
                    user?.preferences.theme === 'dark' && achievement.rarity === 'legendary' && styles.darkAchievementLegendary,
                    user?.preferences.theme === 'dark' && achievement.rarity === 'epic' && styles.darkAchievementEpic,
                    user?.preferences.theme === 'dark' && achievement.rarity === 'rare' && styles.darkAchievementRare,
                  ]}
                  activeOpacity={0.8}
                >
                  {/* Enhanced Achievement Icon with Glow Effects */}
                  <View style={[
                    styles.revampedAchievementIconContainer, 
                    { backgroundColor: achievement.earned ? achievement.color : '#E5E7EB' }
                  ]}>
                    {achievement.earned && (
                      <>
                        <View style={[
                          styles.revampedAchievementIconGlow, 
                          { backgroundColor: `${achievement.color}30` }
                        ]} />
                        <View style={[
                          styles.revampedAchievementIconRing,
                          { borderColor: `${achievement.color}60` }
                        ]} />
                      </>
                    )}
                    <MaterialIcons 
                      name={achievement.icon as any} 
                      size={32} 
                      color={achievement.earned ? "white" : "#9CA3AF"} 
                    />
                  </View>
                  
                  {/* Enhanced Progress Ring for Incomplete Achievements */}
                  {!achievement.earned && achievement.progress !== undefined && (
                    <View style={styles.revampedAchievementProgress}>
                      <View style={styles.revampedProgressRingBackground} />
                      <View 
                        style={[
                          styles.revampedProgressRingFill,
                          { 
                            borderTopColor: achievement.color,
                            borderRightColor: achievement.progress > 25 ? achievement.color : 'transparent',
                            borderBottomColor: achievement.progress > 50 ? achievement.color : 'transparent',
                            borderLeftColor: achievement.progress > 75 ? achievement.color : 'transparent',
                          }
                        ]} 
                      />
                      <View style={[
                        styles.revampedProgressCenter,
                        user?.preferences.theme === 'dark' && styles.darkAchievementProgressCenter
                      ]}>
                        <Text style={[
                          styles.revampedProgressText,
                          { color: achievement.color },
                          user?.preferences.theme === 'dark' && styles.darkAchievementProgressText
                        ]}>{Math.round(achievement.progress || 0)}%</Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Enhanced Achievement Content */}
                  <View style={styles.revampedAchievementContent}>
                    <View style={styles.revampedAchievementTitleContainer}>
                      <Text style={[
                        styles.revampedAchievementTitle, 
                        !achievement.earned && styles.achievementTitleInactive,
                        user?.preferences.theme === 'dark' && styles.darkText,
                        user?.preferences.theme === 'dark' && styles.darkAchievementTitle
                      ]}>
                        {achievement.title}
                      </Text>
                      {achievement.earned && (
                        <View style={[
                          styles.revampedRarityBadge, 
                          { backgroundColor: achievement.color }
                        ]}>
                          <Text style={styles.revampedRarityText}>
                            {achievement.rarity}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={[
                      styles.revampedAchievementDescription, 
                      user?.preferences.theme === 'dark' && styles.darkSubText,
                      user?.preferences.theme === 'dark' && styles.darkAchievementDescription
                    ]}>
                      {achievement.description}
                    </Text>
                    
                    {/* Enhanced XP Reward */}
                    <View style={[
                      styles.revampedXPReward,
                      user?.preferences.theme === 'dark' && styles.darkAchievementReward
                    ]}>
                      <MaterialIcons name="bolt" size={16} color="#FFD700" />
                      <Text style={styles.revampedXPRewardText}>
                        +{achievement.xpReward} XP
                      </Text>
                    </View>
                  </View>
                  
                  {/* Enhanced Earned Badge */}
                  {achievement.earned && (
                    <View style={styles.revampedEarnedBadge}>
                      <MaterialIcons name="check" size={18} color="white" />
                    </View>
                  )}
                  
                  {/* Enhanced Special Effects for Legendary */}
                  {achievement.earned && achievement.rarity === 'legendary' && (
                    <View style={styles.revampedLegendarySparkles}>
                      <MaterialIcons name="auto-awesome" size={14} color="#FFD700" style={styles.revampedSparkle1} />
                      <MaterialIcons name="auto-awesome" size={10} color="#FFA500" style={styles.revampedSparkle2} />
                      <MaterialIcons name="auto-awesome" size={12} color="#FFD700" style={styles.revampedSparkle3} />
                      <MaterialIcons name="auto-awesome" size={8} color="#FFA500" style={styles.revampedSparkle4} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Enhanced Achievement Summary */}
            <View style={styles.revampedAchievementSummary}>
              <LinearGradient
                colors={['#667eea', '#764ba2', '#667eea']}
                style={styles.revampedAchievementSummaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Background Effects */}
                <View style={styles.summaryBackgroundEffects}>
                  <View style={[styles.summaryFloatingOrb, styles.summaryOrb1]} />
                  <View style={[styles.summaryFloatingOrb, styles.summaryOrb2]} />
                  <View style={[styles.summaryFloatingOrb, styles.summaryOrb3]} />
                </View>
                
                <View style={styles.revampedAchievementSummaryContent}>
                  <View style={styles.revampedAchievementSummaryLeft}>
                    <View style={styles.revampedAchievementSummaryIcon}>
                      <MaterialIcons name="emoji-events" size={32} color="white" />
                    </View>
                    <View style={styles.revampedAchievementSummaryText}>
                      <Text style={styles.revampedAchievementSummaryTitle}>
                        Achievement Report
                      </Text>
                     
        
                      {/* Achievement Progress Bar */}
                      <View style={styles.achievementMasterProgress}>
                        <View style={styles.achievementMasterProgressBar}>
                          <View 
                            style={[
                              styles.achievementMasterProgressFill,
                              { 
                                width: `${getAchievements().length > 0 ? (getAchievements().filter(a => a.earned).length / getAchievements().length) * 100 : 0}%`
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.achievementMasterProgressText}>
                          {getAchievements().length > 0 ? Math.round((getAchievements().filter(a => a.earned).length / getAchievements().length) * 100) : 0}% Complete
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.revampedAchievementSummaryRight}>
                    <View style={styles.summaryStatsContainer}>
                      <View style={styles.summaryStatItem}>
                        <Text style={styles.summaryStatValue}>
                          {getAchievements().filter(a => a.earned).length}
                        </Text>
                        <Text style={styles.summaryStatLabel}>Earned</Text>
                      </View>
                      <View style={styles.summaryStatDivider} />
                      <View style={styles.summaryStatItem}>
                        <Text style={styles.summaryStatValue}>
                          {getAchievements().length}
                        </Text>
                        <Text style={styles.summaryStatLabel}>Total</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Daily Challenges Section */}
        <View style={styles.section}>
          <View style={styles.challengesSectionHeader}>
            <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Daily Challenges</Text>
            <View style={[
              styles.challengesXPBadge,
              user?.preferences.theme === 'dark' && styles.darkChallengesXPBadge
            ]}>
              <MaterialIcons name="flash-on" size={16} color="#FFD700" />
              <Text style={styles.challengesXPText}>
                +{dailyChallengesXPEarned} XP Earned
              </Text>
            </View>
          </View>
          
          {/* XP Motivation Message */}
          {dailyChallengesXPRemaining > 0 && (
            <View style={[
              styles.xpMotivationContainer,
              user?.preferences.theme === 'dark' && styles.darkXPMotivationContainer
            ]}>
              <MaterialIcons name="emoji-events" size={20} color="#FFB020" />
              <Text style={[
                styles.xpMotivationText, 
                user?.preferences.theme === 'dark' && styles.darkText,
                user?.preferences.theme === 'dark' && styles.darkXPMotivationText
              ]}>
                Complete challenges to earn{' '}
                <Text style={styles.xpMotivationHighlight}>
                  +{dailyChallengesXPRemaining} XP
                </Text>
                {' '}and level up! 🚀
              </Text>
            </View>
          )}
          
          <View style={styles.challengesContainer}>
            {getDailyChallenges.map((challenge, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.challengeCard, user?.preferences.theme === 'dark' && styles.darkCard]}
                activeOpacity={0.8}
                onPress={challenge.onPress}
              >
                <LinearGradient
                  colors={[challenge.gradient[0], challenge.gradient[1]]}
                  style={styles.challengeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeIconContainer}>
                      <MaterialIcons name={challenge.icon as any} size={28} color="white" />
                    </View>
                    <View style={styles.challengeReward}>
                      <MaterialIcons name="flash-on" size={14} color="#FFD700" />
                      <Text style={styles.challengeXP}>+{challenge.xp} XP</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  
                  <View style={styles.challengeProgress}>
                    <View style={styles.challengeProgressBar}>
                      <View 
                        style={[
                          styles.challengeProgressFill, 
                          { 
                            width: `${challenge.progress}%`,
                            backgroundColor: challenge.progressColor 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.challengeProgressText}>
                      {challenge.current}/{challenge.target}
                    </Text>
                  </View>
                  
                  <View style={styles.challengeFooter}>
                    <View style={styles.challengeDifficultyContainer}>
                      <View style={[styles.challengeDifficultyDot, { backgroundColor: challenge.progressColor }]} />
                      <Text style={styles.challengeDifficulty}>
                        {challenge.difficulty}
                      </Text>
                    </View>
                    <View style={styles.challengeStatus}>
                      {challenge.progress >= 100 ? (
                        <View style={styles.challengeCompleteBadge}>
                          <MaterialIcons name="check-circle" size={20} color="#4ADE80" />
                          <Text style={styles.challengeCompleteText}>Earned!</Text>
                        </View>
                      ) : (
                        <View style={styles.challengePendingBadge}>
                          <MaterialIcons name="radio-button-unchecked" size={20} color="rgba(255, 255, 255, 0.6)" />
                        </View>
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Level Up Motivation */}
          {getXPProgress.progressToNextLevel > 75 && (
            <View style={styles.levelUpMotivation}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.levelUpGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="star" size={24} color="white" />
                <Text style={styles.levelUpText}>
                  Almost Level {getXPProgress.level + 1}! Only {getXPProgress.nextLevelXP - getXPProgress.currentLevelXP} XP to go! ⭐
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFFE',
    overflow: 'hidden',
  },
  
  // ENHANCED HERO SECTION
  heroSection: {
    width: '100%',
    marginBottom: 20,
  },
  heroGradient: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    paddingTop: 80,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 280,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  orb1: {
    width: 120,
    height: 120,
    top: '10%',
    right: '15%',
  },
  orb2: {
    width: 80,
    height: 80,
    top: '60%',
    left: '10%',
  },
  orb3: {
    width: 60,
    height: 60,
    top: '35%',
    right: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  heroEmoji: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 15,
    fontFamily: 'System',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 22,
    paddingHorizontal: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  statusCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 120,
  },
  statusCardText: {
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  statusCardLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusCardValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '700',
    marginTop: 1,
  },

  // ENHANCED QUICK ACTIONS
  enhancedQuickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  quickActionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  enhancedQuickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  quickActionAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  // ENHANCED STATS GRID
  enhancedStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  
  // REFINED PROGRESS SECTION STYLES
  progressSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressOverallBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  progressOverallText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // REFINED STAT CARD STYLES
  refinedStatCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  statCardFloatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statFloatingDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: '15%',
    right: '20%',
  },
  statFloatingRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    top: '70%',
    left: '15%',
  },
  refinedStatCardContent: {
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  refinedStatIconContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
  },
  refinedStatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -12,
    left: -12,
    opacity: 0.3,
    zIndex: -1,
  },
  refinedProgressContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  refinedProgressRing: {
    width: 60,
    height: 60,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refinedProgressRingBackground: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
  },
  refinedProgressRingFill: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#4ECDC4',
    borderRightColor: '#4ECDC4',
    borderBottomColor: '#4ECDC4',
  },
  refinedProgressCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refinedProgressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  refinedStatValues: {
    alignItems: 'center',
    marginBottom: 12,
  },
  refinedStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    textAlign: 'center',
  },
  refinedStatTotal: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
  },
  refinedStatTitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  refinedProgressBar: {
    width: '100%',
    marginBottom: 12,
  },
  refinedProgressBarBackground: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  refinedProgressBarFill: {
    height: '100%',
    borderRadius: 3,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  refinedStatStatus: {
    width: '100%',
    alignItems: 'center',
  },
  refinedStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  refinedStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  enhancedStatCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  enhancedStatIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  statProgress: {
    width: 40,
    height: 40,
  },
  progressRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingFill: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#4ECDC4',
    borderRightColor: '#4ECDC4',
  },
  enhancedStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    textAlign: 'center',
  },
  enhancedStatTotal: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#7F8C8D',
  },
  enhancedStatTitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    fontWeight: '500',
  },

  // ENHANCED INSIGHTS CARD
  enhancedInsightCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  enhancedInsightGradient: {
    padding: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  insightPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  patternCircle1: {
    width: 100,
    height: 100,
    top: '10%',
    right: '15%',
  },
  patternCircle2: {
    width: 80,
    height: 80,
    top: '60%',
    left: '10%',
  },
  patternCircle3: {
    width: 60,
    height: 60,
    top: '80%',
    right: '60%',
  },
  enhancedInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 10,
  },
  insightIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightTitleContainer: {
    flex: 1,
  },
  enhancedInsightTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  insightSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  enhancedInsightPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  progressCircleLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 4,
  },
  enhancedInsightMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '500',
    zIndex: 10,
  },
  enhancedInsightStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  enhancedInsightStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  middleStat: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  enhancedInsightStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  enhancedInsightStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },

  // ENHANCED QUOTE CARD
  enhancedQuoteCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  enhancedQuoteGradient: {
    padding: 28,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
  },
  quoteBackgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  quoteBubble: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  quoteBubble1: {
    width: 80,
    height: 80,
    top: '20%',
    right: '10%',
  },
  quoteBubble2: {
    width: 60,
    height: 60,
    top: '70%',
    left: '15%',
  },
  quoteBubble3: {
    width: 40,
    height: 40,
    top: '30%',
    right: '5%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  quotePattern: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  quotePattern1: {
    width: 20,
    height: 20,
    top: '25%',
    left: '25%',
    transform: [{ rotate: '45deg' }],
  },
  quotePattern2: {
    width: 16,
    height: 16,
    top: '65%',
    right: '25%',
    transform: [{ rotate: '30deg' }],
  },
  quoteCategoryContainer: {
    alignItems: 'flex-end',
    flex: 1,
  },
  quoteCounter: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginTop: 4,
  },
  quoteContentContainer: {
    alignItems: 'center',
    marginVertical: 20,
    zIndex: 10,
  },
  quoteMarks: {
    position: 'absolute',
    top: -20,
    left: -10,
    zIndex: 1,
  },
  quoteAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  quoteAuthorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  },
  enhancedQuoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    zIndex: 10,
  },
  quoteIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedQuoteBadge: {
    fontSize: 13,
    color: 'white',
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 1,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  enhancedQuoteText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
    lineHeight: 28,
    fontWeight: '600',
    zIndex: 10,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  enhancedQuoteAuthor: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '700',
    textAlign: 'center',
    zIndex: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    zIndex: 10,
    marginTop: 8,
  },
  quoteActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // DAILY CHALLENGES STYLES - Enhanced Design with Dark Mode
  challengesContainer: {
    gap: 20,
  },
  challengeCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 6,
    transform: [{ scale: 1 }],
  },
  challengeGradient: {
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 160,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  challengeReward: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeXP: {
    fontSize: 13,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  challengeDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  challengeProgressBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 5,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  challengeProgressText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
    minWidth: 45,
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeDifficulty: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  challengeStatus: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ENHANCED DAILY CHALLENGES SECTION STYLES
  challengesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  challengesXPBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  challengesXPText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFB020',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  xpMotivationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 24,
    gap: 12,
    borderLeftWidth: 6,
    borderLeftColor: '#FFB020',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  xpMotivationText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  xpMotivationHighlight: {
    color: '#FFB020',
    fontWeight: 'bold',
  },
  challengeDifficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeDifficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  challengeCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeCompleteText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4ADE80',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  challengePendingBadge: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpMotivation: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  levelUpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  levelUpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // XP PROGRESS & ACHIEVEMENT STYLES
  xpProgressCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: 20,
  },
  xpProgressGradient: {
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  xpBackgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  xpPatternElement: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  xpPattern1: {
    width: 40,
    height: 40,
    top: '10%',
    right: '15%',
    transform: [{ rotate: '45deg' }],
  },
  xpPattern2: {
    width: 30,
    height: 30,
    top: '70%',
    left: '10%',
    transform: [{ rotate: '30deg' }],
  },
  xpPattern3: {
    width: 20,
    height: 20,
    top: '40%',
    right: '80%',
    transform: [{ rotate: '60deg' }],
  },
  xpProgressContent: {
    zIndex: 10,
  },
  xpLevelContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  xpLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 8,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  xpLevelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  xpTotalText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  xpProgressContainer: {
    marginBottom: 16,
  },
  xpProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpProgressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  xpProgressNumbers: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  xpProgressBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  xpProgressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 6,
  },
  xpDailyContainer: {
    alignItems: 'center',
  },
  xpDailyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  xpDailyText: {
    fontSize: 12,
    color: '#4ADE80',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // ACHIEVEMENTS STYLES - Enhanced Design with Dark Mode
  achievementsContainer: {
    marginTop: 10,
  },

  // REVAMPED ACHIEVEMENTS STYLES
  revampedAchievementsHeader: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  achievementsHeaderLeft: {
    width: '100%',
    marginBottom: 16,
  },
  achievementsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  revampedAchievementsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C3E50',
    letterSpacing: 0.5,
  },
  achievementsSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 18,
  },
  achievementsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  revampedAchievementsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFE4B5',
  },
  achievementCountIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementCountText: {
    alignItems: 'center',
  },
  achievementCountNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFB020',
  },
  achievementCountLabel: {
    fontSize: 12,
    color: '#FFB020',
    fontWeight: '600',
  },
  achievementProgressRingContainer: {
    alignItems: 'center',
  },
  achievementOverallProgressRing: {
    width: 60,
    height: 60,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementOverallProgressBackground: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  achievementOverallProgressFill: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#4ECDC4',
    borderRightColor: '#4ECDC4',
    borderBottomColor: '#4ECDC4',
  },
  achievementOverallProgressCenter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementOverallProgressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  rarityFilterContainer: {
    marginBottom: 20,
  },
  rarityFilterScroll: {
    paddingVertical: 4,
  },
  rarityFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rarityFilterChipActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.3,
  },
  rarityFilterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  rarityFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  rarityFilterTextActive: {
    color: 'white',
  },
  darkRarityFilterChip: {
    backgroundColor: '#374151',
  },
  darkRarityFilterText: {
    color: '#D1D5DB',
  },

  // ENHANCED ACHIEVEMENT GRID STYLES
  revampedAchievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  revampedAchievementCard: {
    width: (width - 72) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
    minHeight: 220,
    maxHeight: 240,
    transform: [{ scale: 1 }],
  },
  revampedAchievementCardEarned: {
    transform: [{ scale: 1.02 }],
  },
  revampedAchievementCardInactive: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },

  // ENHANCED RARITY STYLES
  revampedAchievementLegendary: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
  },
  revampedAchievementEpic: {
    borderColor: '#9333EA',
    backgroundColor: '#FAF5FF',
    shadowColor: '#9333EA',
    shadowOpacity: 0.5,
  },
  revampedAchievementRare: {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F9FF',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.4,
  },
  revampedAchievementCommon: {
    borderColor: '#6B7280',
    backgroundColor: '#F9FAFB',
    shadowColor: '#6B7280',
    shadowOpacity: 0.3,
  },

  // ENHANCED ACHIEVEMENT ICON STYLES
  revampedAchievementIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  revampedAchievementIconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -20,
    left: -20,
    zIndex: -1,
    opacity: 0.4,
  },
  revampedAchievementIconRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    top: -4,
    left: -4,
    zIndex: -1,
  },

  // ENHANCED PROGRESS STYLES
  revampedAchievementProgress: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revampedProgressRingBackground: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  revampedProgressRingFill: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  revampedProgressCenter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  revampedProgressText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },

  // ENHANCED CONTENT STYLES
  revampedAchievementContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    width: '100%',
    paddingVertical: 8,
  },
  revampedAchievementTitleContainer: {
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  revampedAchievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 18,
    minHeight: 36,
    paddingHorizontal: 4,
  },
  revampedRarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  revampedRarityText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  revampedAchievementDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    paddingHorizontal: 4,
    minHeight: 32,
    flex: 1,
  },
  revampedXPReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFE4B5',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  revampedXPRewardText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFB020',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ENHANCED EARNED BADGE
  revampedEarnedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: 'white',
  },

  // SPECIAL EFFECTS
  revampedLegendarySparkles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  revampedSparkle1: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  revampedSparkle2: {
    position: 'absolute',
    top: 28,
    right: 28,
  },
  revampedSparkle3: {
    position: 'absolute',
    bottom: 40,
    left: 24,
  },
  revampedSparkle4: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },

  // ENHANCED ACHIEVEMENT SUMMARY STYLES
  revampedAchievementSummary: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  revampedAchievementSummaryGradient: {
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 140,
  },
  summaryBackgroundEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  summaryFloatingOrb: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryOrb1: {
    width: 60,
    height: 60,
    top: '10%',
    right: '15%',
  },
  summaryOrb2: {
    width: 40,
    height: 40,
    top: '70%',
    left: '10%',
  },
  summaryOrb3: {
    width: 30,
    height: 30,
    top: '40%',
    right: '80%',
  },
  revampedAchievementSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  revampedAchievementSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  revampedAchievementSummaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  revampedAchievementSummaryText: {
    flex: 1,
  },
  revampedAchievementSummaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  revampedAchievementSummarySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  revampedAchievementSummaryRight: {
    alignItems: 'center',
    gap: 12,
  },
  summaryProgressCircle: {
    alignItems: 'center',
  },
  summaryProgressRing: {
    width: 72,
    height: 72,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryProgressBackground: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  summaryProgressFill: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: 'white',
    borderRightColor: 'white',
    borderBottomColor: 'white',
  },
  summaryProgressCenter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryProgressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  summaryStatsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  summaryStatLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  summaryStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  },
  achievementMasterProgress: {
    marginTop: 12,
    width: '100%',
  },
  achievementMasterProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  achievementMasterProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  achievementMasterProgressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },

  // VIEW ALL ACHIEVEMENTS BUTTON
  viewAllAchievementsButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 16,
  },
  viewAllButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  darkViewAllButton: {
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.4,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    letterSpacing: 0.5,
  },
  achievementsStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementsCountText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFB020',
  },
  achievementCategories: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryChipTextActive: {
    color: 'white',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  enhancedAchievementBadge: {
    width: (width - 72) / 2,
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
    minHeight: 200,
    maxHeight: 220,
  },
  achievementBadgeInactive: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  achievementLegendary: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    backgroundColor: '#FFFBF0',
  },
  achievementEpic: {
    borderColor: '#9333EA',
    shadowColor: '#9333EA',
    shadowOpacity: 0.4,
    backgroundColor: '#FAF5FF',
  },
  achievementRare: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    backgroundColor: '#F0F9FF',
  },
  rarityBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 3,
  },
  rarityBorderLegendary: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  rarityBorderEpic: {
    borderColor: '#9333EA',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  rarityBorderRare: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  enhancedAchievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  achievementIconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -12,
    left: -12,
    zIndex: -1,
    opacity: 0.6,
  },
  achievementProgressRing: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementProgressBackground: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  achievementProgressFill: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#3B82F6',
  },
  achievementProgressCenter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementProgressText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  enhancedAchievementContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    width: '100%',
    paddingVertical: 8,
    minHeight: 100,
  },
  achievementTitleRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
  },
  enhancedAchievementTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16,
    minHeight: 32,
    paddingHorizontal: 4,
  },
  achievementTitleInactive: {
    color: '#9CA3AF',
  },
  rarityChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
    alignSelf: 'center',
  },
  rarityChipText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  enhancedAchievementDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
    paddingHorizontal: 4,
    minHeight: 32,
    flex: 1,
  },
  achievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE4B5',
    alignSelf: 'center',
  },
  achievementRewardText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFB020',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementProgressBar: {
    width: '100%',
    marginTop: 6,
  },
  achievementProgressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  achievementProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  enhancedAchievementEarnedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  legendarySparkles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle1: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  sparkle2: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  sparkle3: {
    position: 'absolute',
    bottom: 32,
    left: 20,
  },
  achievementSummary: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 8,
  },
  achievementSummaryGradient: {
    padding: 16,
  },
  achievementSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementSummaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementSummaryText: {
    flex: 1,
  },
  achievementSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  achievementSummarySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  achievementSummaryProgress: {
    alignItems: 'center',
  },
  achievementSummaryPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  // LEGACY STYLES (updated for compatibility)
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  headerLeft: {
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  firstSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
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

  // DARK MODE STYLES - Enhanced with Achievement & Challenge Support
  darkContainer: {
    backgroundColor: '#1E1E1E',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubText: {
    color: '#CCCCCC',
  },
  darkCard: {
    backgroundColor: '#2A2A2A',
    borderColor: '#3A3A3A',
  },
  darkBorder: {
    borderColor: '#3A3A3A',
  },
  
  // Dark Mode - Achievement Styles
  darkAchievementBadge: {
    backgroundColor: '#2A2A2A',
    borderColor: '#3A3A3A',
  },
  darkAchievementLegendary: {
    backgroundColor: '#2D2A1A',
    borderColor: '#FFD700',
  },
  darkAchievementEpic: {
    backgroundColor: '#2A1E2D',
    borderColor: '#9333EA',
  },
  darkAchievementRare: {
    backgroundColor: '#1E252D',
    borderColor: '#3B82F6',
  },
  darkAchievementTitle: {
    color: '#FFFFFF',
  },
  darkAchievementDescription: {
    color: '#CCCCCC',
  },
  darkAchievementReward: {
    backgroundColor: '#3A3A3A',
    borderColor: '#4A4A4A',
  },
  darkAchievementProgressCenter: {
    backgroundColor: '#2A2A2A',
  },
  darkAchievementProgressText: {
    color: '#FFFFFF',
  },
  darkAchievementsCount: {
    backgroundColor: '#3A3A3A',
    borderColor: '#4A4A4A',
  },
  
  // Dark Mode - Challenge Styles
  darkXPMotivationContainer: {
    backgroundColor: '#2A2A2A',
    borderLeftColor: '#FFB020',
  },
  darkXPMotivationText: {
    color: '#CCCCCC',
  },
  darkChallengesXPBadge: {
    backgroundColor: '#3A3A3A',
    borderColor: '#FFD700',
  },
  darkLevelUpText: {
    color: '#FFFFFF',
  },

  // EXTENSIVE ORIGINAL STYLES (for backward compatibility)
  greetingSection: {
    marginBottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  greetingGradientBackground: {
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 16,
    marginVertical: 10,
  },
  spectacularBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 20,
  },
  dynamicGradient: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 30,
  },
  floatingParticle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  particle1: {
    width: 8,
    height: 8,
    top: '20%',
    left: '15%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  particle2: {
    width: 12,
    height: 12,
    top: '60%',
    right: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  particle3: {
    width: 6,
    height: 6,
    top: '40%',
    left: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default HomeScreen;