import { getCoachAnswer } from '../utils/aiCoachApi';
import React, { useState, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { useFitbitData } from '../hooks/useFitbitData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
// Use typed hooks for Redux
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
// Removed duplicate custom hook imports
import { useAppSelector, useAppDispatch } from '../store';
import { updateGoalProgress, loadUserGoalsAsync, deleteGoalAsync } from '../store/goalsSlice';
import { createGoalAsync } from '../store/goalsSlice';
import { toggleHabitCompletion, loadUserHabitsAsync, createHabitAsync } from '../store/habitsSlice';
import { loadUserTasksAsync, createTaskAsync } from '../store/tasksSlice';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { saveData, getData } from '../utils/offlineStorage';
import FocusModeScreen from './FocusModeScreen';
import NetInfo from '@react-native-community/netinfo';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const FITBIT_CLIENT_ID = 'YOUR_FITBIT_CLIENT_ID'; // TODO: Replace with your Fitbit app client ID
const FITBIT_REDIRECT_URI = 'YOUR_APP_SCHEME://fitbit'; // TODO: Replace with your app's redirect URI (must match Fitbit app settings)

const GEMINI_API_KEY = 'AIzaSyAMvLbVErhysEjv7cv0omsOXLpUqVkb2h8';

const ProgressScreen: React.FC = () => {
  // Redux, navigation, and helpers
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  
  // Memoized Redux selectors to prevent unnecessary re-renders
  const reduxData = useAppSelector(state => ({
    goals: state.goals.goals,
    habits: state.habits.habits,
    user: state.user.user,
    sessions: state.meditation.sessions,
    categories: state.tasks.categories,
  }));
  
  const { goals, habits, user, sessions, categories } = reduxData;
  const safeAreaInsets = useSafeAreaInsets();
  const { showSuccess, showError, showInfo, toast } = useToast();
  // ...existing code...

  // Biometric hooks (safe for Expo Go and non-iOS)
  let appleHealth = { heartRate: 0, sleep: 0, steps: 0 };
  if (Platform.OS === 'ios') {
    try {
      // Only call hook if HealthKit module is available
      // Apple Health integration removed
    } catch (e) {
      // Fallback: do nothing, use default values
    }
  }
  const fitbit = useFitbitData(user?.id || '');

  // Delete goal logic
  const handleDeleteGoal = async (goalId: string) => {
    if (!user?.id) return;
    try {
      await (dispatch as any)(deleteGoalAsync(goalId)).unwrap();
      await (dispatch as any)(loadUserGoalsAsync(user.id));
      showSuccess('Goal deleted!', 'Deleted');
    } catch (error) {
      showError('Failed to delete goal', 'Error');
    }
  };
  // Add Goal Modal state
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalColor, setNewGoalColor] = useState('#4ECDC4');
  const [newGoalType, setNewGoalType] = useState<'weekly' | 'monthly' | 'daily'>('weekly');
  const [newGoalTarget, setNewGoalTarget] = useState(100);
  const [newGoalIcon, setNewGoalIcon] = useState('track-changes');

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const handleAddGoal = async () => {
    if (!newGoalName.trim() || !user?.id) {
      showError('Goal name is required', 'Missing Info');
      return;
    }
    setIsAddingGoal(true);
    try {
      // Save to backend via Redux async thunk
      await (dispatch as any)(createGoalAsync({
        userId: user.id,
        goalData: {
          name: newGoalName.trim(),
          description: newGoalDescription.trim(),
          target: newGoalTarget,
          color: newGoalColor,
          icon: newGoalIcon,
          type: newGoalType,
        }
      })).unwrap();
      // Reload goals from backend
      await (dispatch as any)(loadUserGoalsAsync(user.id));
      // Reset modal and fields only after success
      setShowAddGoalModal(false);
      setNewGoalName('');
      setNewGoalDescription('');
      setNewGoalColor('#4ECDC4');
      setNewGoalType('weekly');
      setNewGoalTarget(100);
      setNewGoalIcon('track-changes');
      showSuccess('Goal added successfully!', 'Success');
    } catch (error) {
      showError('Failed to add goal. Please check your connection or try again.', 'Error');
    }
    setIsAddingGoal(false);
  };
  // Load reminders from AsyncStorage on mount (other data loaded via Redux)
  useEffect(() => {
    (async () => {
      try {
        const storedReminders = await AsyncStorage.getItem('userReminders');
        if (storedReminders) {
          setReminders(JSON.parse(storedReminders));
        }
      } catch (error) {
        console.error('Error loading offline reminders:', error);
      }
    })();
  }, []);
  // ...existing code...

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminders, setReminders] = useState<Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    color: string;
  }>>([]);
  const [showGoalUpdateModal, setShowGoalUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [goalProgressInput, setGoalProgressInput] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [showConnectDeviceModal, setShowConnectDeviceModal] = useState(false);
  const [fitbitToken, setFitbitToken] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [coachMessages, setCoachMessages] = useState(() => {
    const hour = new Date().getHours();
    const name = user?.name || 'there';
    let greeting = '';
    
    if (hour < 6) greeting = `Good evening, ${name}! 🌙`;
    else if (hour < 12) greeting = `Good morning, ${name}! ☀️`;
    else if (hour < 17) greeting = `Good afternoon, ${name}! 🌞`;
    else if (hour < 21) greeting = `Good evening, ${name}! 🌅`;
    else greeting = `Good night, ${name}! ⭐`;
    
    return [
      { 
        sender: 'coach', 
        text: `${greeting}\n\nI'm your dedicated Wellness Coach, and I'm genuinely excited to be part of your journey! 🌟\n\nI see you've been working on building better habits and reaching your goals - that takes real courage and commitment. I'm here to provide personalized, evidence-based guidance while celebrating every step of your progress.\n\n💭 What I can help you with:\n\n🧘 Mindfulness & Stress Relief - Techniques for anxiety, meditation guidance, breathing exercises\n💪 Physical Wellness - Exercise routines, nutrition tips, sleep optimization\n🎯 Goal Achievement - Breaking down big dreams, staying motivated, overcoming obstacles\n🌱 Habit Building - Science-backed strategies for lasting change\n❤️ Emotional Support - Managing difficult emotions, building resilience\n⚡ Productivity & Focus - Time management, concentration techniques\n🤝 Relationships - Communication skills, boundary setting\n\nI can also:\n✨ Create personalized habits and tasks for you\n📊 Analyze your progress patterns\n🎉 Celebrate your wins (big and small!)\n💡 Offer daily inspiration and tips\n\nRemember, every small step counts, and I'm here to remind you how amazing you're doing. What's on your mind today? What would feel most helpful right now? 💚`
      }
    ];
  });
  const [coachInput, setCoachInput] = useState('');
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Only load offline data once when going offline
  useEffect(() => {
    if (isOffline) {
      (async () => {
        const offlineReminders = await getData('reminders');
        if (offlineReminders) setReminders(offlineReminders);
      })();
    }
  }, [isOffline]);

  // Debounce saving reminders to AsyncStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      AsyncStorage.setItem('userReminders', JSON.stringify(reminders));
    }, 500);
    return () => clearTimeout(timeout);
  }, [reminders]);

  // Only load user data once on mount or user change
  useEffect(() => {
    if (user?.id) {
      (dispatch as any)(loadUserGoalsAsync(user.id));
      (dispatch as any)(loadUserHabitsAsync(user.id));
      (dispatch as any)(loadUserTasksAsync(user.id));
    }
  }, [dispatch, user?.id]);

  const getCurrentMonth = () => {
    return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getWeekDays = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: Array<number | null> = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    const isCurrentMonth = selectedDate.getMonth() === today.getMonth() && 
                          selectedDate.getFullYear() === today.getFullYear();
    return isCurrentMonth && day === today.getDate();
  };

  const hasHabitCompletion = (day: number | null) => {
    if (!day) return false;
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toISOString().split('T')[0];
    return habits.some(habit => habit.completedDates.includes(dateStr));
  };

  const hasMeditationSession = (day: number | null) => {
    if (!day) return false;
    // Check if there are any completed meditation sessions on this day
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toISOString().split('T')[0];
    return sessions.some(session => 
      session.completed_at && 
      new Date(session.completed_at).toISOString().split('T')[0] === dateStr
    );
  };

  const hasReminder = (day: number | null) => {
    if (!day) return false;
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toISOString().split('T')[0];
    return reminders.some(reminder => reminder.date === dateStr);
  };

  const addReminder = () => {
    if (!reminderTitle.trim() || !selectedDay) {
      showError('Please select a day and enter a title for the reminder.', 'Missing Info');
      return;
    }
    
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDay).toISOString().split('T')[0];
    const newReminder = {
      id: Date.now().toString(),
      title: reminderTitle,
      date: dateStr,
      time: reminderTime || '09:00',
      color: '#FFE066',
    };
    
    setReminders([...reminders, newReminder]);
    setReminderTitle('');
    setReminderTime('');
    setShowAddReminderModal(false);
    showSuccess('Reminder added successfully!', 'Success');
  };

  const deleteReminder = (reminderId: string) => {
    setReminders(reminders.filter(r => r.id !== reminderId));
    showSuccess('Reminder deleted!', 'Success');
  };

  const toggleHabitForDay = async (habitId: string, day: number) => {
    try {
      const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toISOString().split('T')[0];
      await (dispatch as any)(toggleHabitCompletion({ habitId, date: dateStr })).unwrap();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const handleGoalPress = (goal: any) => {
    setSelectedGoal(goal);
    setGoalProgressInput(goal.progress.toString());
    setShowGoalUpdateModal(true);
  };

  const updateGoalProgressValue = async () => {
    if (!selectedGoal) return;
    
    const newProgress = parseInt(goalProgressInput);
    if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
      showError('Please enter a valid percentage (0-100)', 'Error');
      return;
    }
    
    try {
      await (dispatch as any)(updateGoalProgress({ goalId: selectedGoal.id, progress: newProgress })).unwrap();
      // Reload goals to update UI
      if (user?.id) {
        await (dispatch as any)(loadUserGoalsAsync(user.id));
      }
      if (newProgress === 100) {
        showSuccess('You have completed this goal!', '🎉 Congratulations!');
      } else {
        showSuccess('Goal progress updated!', 'Success');
      }
      setShowGoalUpdateModal(false);
      setSelectedGoal(null);
      setGoalProgressInput('');
    } catch (error) {
      console.error('Failed to update goal progress:', error);
      showError('Failed to update goal progress', 'Error');
    }
  };

  const incrementGoalProgress = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.progress < 100) {
      const newProgress = Math.min(goal.progress + 10, 100);
      try {
        await (dispatch as any)(updateGoalProgress({ goalId, progress: newProgress })).unwrap();
        // Reload goals to update UI
        if (user?.id) {
          await (dispatch as any)(loadUserGoalsAsync(user.id));
        }
        if (newProgress === 100) {
          showSuccess('You have completed this goal!', '🎉 Congratulations!');
        } else {
          showSuccess(`Progress increased to ${Math.round(newProgress)}%`, 'Progress Updated');
        }
      } catch (error) {
        console.error('Failed to update goal progress:', error);
        showError('Failed to update goal progress', 'Error');
      }
    } else if (goal && goal.progress >= 100) {
      showInfo('This goal is already at 100%!', 'Goal Complete');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    
    const events: Array<{
      type: string;
      title: string;
      color: string;
      icon: string;
      id?: string;
      time?: string;
    }> = [];
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toISOString().split('T')[0];
    
    // Check for habit completions
    habits.forEach(habit => {
      if (habit.completedDates.includes(dateStr)) {
        events.push({
          type: 'habit',
          title: habit.name,
          color: habit.color,
          icon: habit.icon,
        });
      }
    });
    
    // Check for reminders
    reminders.forEach(reminder => {
      if (reminder.date === dateStr) {
        events.push({
          type: 'reminder',
          title: reminder.title,
          color: reminder.color,
          icon: 'notifications',
          id: reminder.id,
          time: reminder.time,
        });
      }
    });
    
    // Check for meditation sessions
    const meditationDateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toISOString().split('T')[0];
    sessions.forEach(session => {
      if (session.completed_at && new Date(session.completed_at).toISOString().split('T')[0] === meditationDateStr) {
        events.push({
          type: 'meditation',
          title: session.name || 'Meditation Session',
          color: session.color || '#4ECDC4',
          icon: 'spa',
        });
      }
    });
    
    return events;
  };

  // Memoized calculations for better performance
  const memoizedStats = useMemo(() => {
    const habitsWithStreaks = habits.filter(h => h.streak > 0).length;
    const completedSessions = sessions.filter(s => s.completed_at).length;
    const totalHabitsToday = habits.reduce((total, habit) => {
      const today = new Date().toISOString().split('T')[0];
      return total + (habit.completedDates?.includes(today) ? 1 : 0);
    }, 0);
    
    return {
      habitsWithStreaks,
      completedSessions,
      totalHabitsToday
    };
  }, [habits, sessions]);

  // Memoize total progress calculation
  const getTotalProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(totalProgress / goals.length);
  }, [goals]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 60) return '#FF9800';
    if (progress >= 40) return '#FFC107';
    return '#F44336';
  };

  // Fitbit OAuth flow
  const handleConnectFitbit = async () => {
    // Step 1: Open Fitbit OAuth login
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${FITBIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(FITBIT_REDIRECT_URI)}&scope=activity%20heartrate%20sleep%20profile&expires_in=31536000`;
    const result = await WebBrowser.openAuthSessionAsync(authUrl, FITBIT_REDIRECT_URI);
    if (result.type === 'success' && result.url) {
      // Step 2: Parse access token from redirect URL fragment
      const match = result.url.match(/access_token=([^&]+)/);
      if (match) {
        const token = match[1];
        setFitbitToken(token);
        // TODO: Store token securely (e.g., AsyncStorage, backend)
        // TODO: Use token to fetch Fitbit data via API
        showSuccess('Fitbit connected!', 'Success');
        setShowConnectDeviceModal(false);
      } else {
        showError('Could not retrieve Fitbit token.', 'Error');
      }
    } else if (result.type === 'cancel') {
      showInfo('Fitbit connection cancelled.', 'Info');
    } else {
      showError('Fitbit connection failed.', 'Error');
    }
  };

  // Enhanced Coach: context-aware, actionable, domain-restricted with emotional intelligence
  const sendCoachMessage = async () => {
    if (!coachInput.trim()) return;
    const userMsg = { sender: 'user', text: coachInput.trim() };
    setCoachMessages(prev => [...prev, userMsg]);
    setCoachInput('');
    setIsCoachLoading(true);
    
    try {
      const lowerText = userMsg.text.toLowerCase();
      
      // Get user context for personalized responses
      const userContext = {
        name: user?.name || 'friend',
        totalGoals: goals.length,
        completedGoals: goals.filter(g => g.progress >= 100).length,
        avgGoalProgress: goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0,
        totalHabits: habits.length,
        activeStreaks: habits.filter(h => h.streak > 0).length,
        longestStreak: habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak || 0)) : 0,
        completedSessions: sessions.filter(s => s.completed_at).length,
        todayHabits: habits.filter(h => {
          const today = new Date().toISOString().split('T')[0];
          return h.completedDates?.includes(today);
        }).length
      };

      // Enhanced NLP for creating habits with more supportive responses
      if (lowerText.includes('create habit') || lowerText.includes('add habit') || lowerText.includes('new habit') || lowerText.includes('start habit')) {
        const match = lowerText.match(/(?:create|add|new|start) habit(?: called| named| for| about)?\s*([^.!?]*)/);
        const habitName = match ? match[1].trim() : 'New Positive Habit';
        
        if (!user?.id) {
          setCoachMessages(prev => [...prev, { 
            sender: 'coach', 
            text: `I'd love to help you create that habit! However, it seems you're not logged in right now. Once you're logged in, I can create personalized habits that sync with your progress. In the meantime, here's a pro tip: start with just 2 minutes a day - it's the secret to building lasting habits! 🌱`
          }]);
          setIsCoachLoading(false);
          return;
        }

        try {
          await (dispatch as any)(createHabitAsync({
            userId: user.id,
            habitData: {
              name: habitName || 'New Positive Habit',
              color: '#FF9999',
              icon: 'check',
            }
          })).unwrap();
          
          setCoachMessages(prev => [...prev, { 
            sender: 'coach', 
            text: `🎉 Amazing! I've created "${habitName}" for you! This is so exciting - you now have ${userContext.totalHabits + 1} habits working toward your better self.\n\n💡 Here's my proven strategy for success:\n\n📅 Start tiny - Begin with just 2-3 minutes daily\n🔗 Stack it - Attach it to an existing routine\n🎯 Track it - You'll find it in your Habits section\n🎉 Celebrate - Acknowledge every single completion!\n\n${userContext.activeStreaks > 0 ? `You're already crushing it with ${userContext.activeStreaks} active streaks - your longest is ${userContext.longestStreak} days! 🔥` : 'This could be the start of your first amazing streak! 🌟'}\n\nWhat specific time of day feels best for this new habit? I can help you plan the perfect routine! 💪`
          }]);
        } catch (err) {
          setCoachMessages(prev => [...prev, { 
            sender: 'coach', 
            text: `I hit a little snag creating that habit, but don't worry! You can easily add it manually in the Habits section. 🛠️\n\nWhile we're talking about habits though - I'm curious: what's driving you to build this new habit? Understanding your "why" is often the key to lasting success! When we connect our habits to our deeper values and goals, we're 3x more likely to stick with them. 🎯\n\nTell me more about what you're hoping to achieve! 💫`
          }]);
        }
        setIsCoachLoading(false);
        return;
      }
      
      // Enhanced NLP for creating tasks with contextual encouragement
      if (lowerText.includes('create task') || lowerText.includes('add task') || lowerText.includes('new task') || lowerText.includes('need to do')) {
        const match = lowerText.match(/(?:create|add|new) task(?: called| named| for)?\s*([^.!?]*)|(?:need to do|should do)\s*([^.!?]*)/);
        const taskName = match ? (match[1] || match[2])?.trim() : 'Important Task';
        const categoryId = categories[0]?.id || '';
        
        if (!user?.id) {
          setCoachMessages(prev => [...prev, { 
            sender: 'coach', 
            text: `I can see you're ready to take action - that's the spirit! 🚀 To create tasks that sync with your progress, you'll need to be logged in. Once you are, I can help you break down any goal into manageable, actionable steps.\n\nRemember: the best task is one that moves you closer to what matters most to you. What's the outcome you're hoping for? 🎯`
          }]);
          setIsCoachLoading(false);
          return;
        }

        try {
          await (dispatch as any)(createTaskAsync({
            userId: user.id,
            categoryId,
            title: taskName || 'Important Task',
          })).unwrap();
          
          setCoachMessages(prev => [...prev, { 
            sender: 'coach', 
            text: `🎯 Perfect! I've added "${taskName}" to your task list!\n\n${userContext.avgGoalProgress > 70 ? `You're absolutely on fire with ${userContext.avgGoalProgress}% average goal progress! 🔥` : userContext.avgGoalProgress > 40 ? `You're making solid progress with ${userContext.avgGoalProgress}% goal completion! 📈` : `Every task completed is a step forward - you've got this! 💪`}\n\n💡 Pro tip for maximum success:\n\n⏰ Time-block it - When will you tackle this?\n🎯 Define "done" - What does completion look like?\n🎉 Plan your reward - How will you celebrate?\n\nBreaking big goals into bite-sized tasks is exactly how extraordinary things happen. You're building the foundation for amazing results! What would you like to accomplish first? ✨`
          }]);
        } catch (err) {
          setCoachMessages(prev => [...prev, { 
            sender: 'coach', 
            text: `I couldn't create that task right now, but your initiative is fantastic! 🌟 You can always add it manually in the Tasks section.\n\nYou know what I love about task planning? It transforms overwhelming goals into manageable steps. What's the bigger picture you're working toward? Sometimes talking through our goals helps us discover the most impactful next actions. 🎯\n\nI'm here to help you strategize and stay motivated! 💪`
          }]);
        }
        setIsCoachLoading(false);
        return;
      }

      // Context-aware motivational responses
      if (lowerText.includes('motivation') || lowerText.includes('motivated') || lowerText.includes('inspire') || lowerText.includes('give up') || lowerText.includes('tired') || lowerText.includes('stuck')) {
        const motivationalResponse = generateMotivationalResponse(userContext, lowerText);
        setCoachMessages(prev => [...prev, { sender: 'coach', text: motivationalResponse }]);
        setIsCoachLoading(false);
        return;
      }

      // Progress analysis responses
      if (lowerText.includes('progress') || lowerText.includes('how am i doing') || lowerText.includes('how\'m i doing') || lowerText.includes('doing well') || lowerText.includes('performance')) {
        const progressResponse = generateProgressAnalysis(userContext);
        setCoachMessages(prev => [...prev, { sender: 'coach', text: progressResponse }]);
        setIsCoachLoading(false);
        return;
      }

      // Stress and anxiety responses
      if (lowerText.includes('stress') || lowerText.includes('anxiety') || lowerText.includes('anxious') || lowerText.includes('overwhelm') || lowerText.includes('panic')) {
        const stressResponse = generateStressResponse(userContext, lowerText);
        setCoachMessages(prev => [...prev, { sender: 'coach', text: stressResponse }]);
        setIsCoachLoading(false);
        return;
      }

      // Sleep and rest responses
      if (lowerText.includes('sleep') || lowerText.includes('insomnia') || lowerText.includes('tired') || lowerText.includes('rest') || lowerText.includes('can\'t sleep')) {
        const sleepResponse = generateSleepResponse(userContext);
        setCoachMessages(prev => [...prev, { sender: 'coach', text: sleepResponse }]);
        setIsCoachLoading(false);
        return;
      }

      // Habit building responses
      if (lowerText.includes('habit') || lowerText.includes('routine') || lowerText.includes('consistent') || lowerText.includes('stick to')) {
        const habitResponse = generateHabitResponse(userContext, lowerText);
        setCoachMessages(prev => [...prev, { sender: 'coach', text: habitResponse }]);
        setIsCoachLoading(false);
        return;
      }

      // For all other queries, use the comprehensive AI Coach with enhanced context
      const contextualPrompt = `User context: ${userContext.name} has ${userContext.totalGoals} goals (${userContext.avgGoalProgress}% avg progress), ${userContext.totalHabits} habits (${userContext.activeStreaks} active streaks, longest: ${userContext.longestStreak} days), ${userContext.completedSessions} meditation sessions, completed ${userContext.todayHabits} habits today. User question: ${userMsg.text}`;
      
      const coachResponse = await getCoachAnswer(contextualPrompt);
      setCoachMessages(prev => [...prev, { sender: 'coach', text: coachResponse }]);
      
    } catch (error) {
      console.error('Coach error:', error);
      setCoachMessages(prev => [...prev, { 
        sender: 'coach', 
        text: `I apologize for the technical hiccup! 💙 Even when technology fails, your commitment to growth doesn't - and that's what truly matters.\n\nAs your wellness coach, I'm still here to support you. Could you try rephrasing your question? Whether it's about stress, habits, motivation, sleep, relationships, or just need someone to listen - I'm here for you. 🌟\n\nRemember: seeking support is a sign of strength, not weakness. You're taking charge of your wellbeing, and that's incredible! 💪`
      }]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  // Helper function for motivational responses
  const generateMotivationalResponse = (context: any, userText: string): string => {
    const responses: string[] = [];
    
    if (userText.includes('give up') || userText.includes('quit')) {
      responses.push(`Hey ${context.name}, I hear you 💙. Feeling like giving up is completely human - it means you care deeply about your goals.`);
      if (context.longestStreak > 0) {
        responses.push(`But look at your strength: you've built a ${context.longestStreak}-day streak before! That proves you have what it takes. 🔥`);
      }
      responses.push(`Here's the truth: every single person who achieved something meaningful wanted to quit at some point. The difference? They kept going anyway.`);
      responses.push(`✨ Let's break this down together:\n\n🎯 What's ONE tiny step you could take today?\n💝 What originally inspired this goal?\n🤝 How can I support you right now?\n\nYou're stronger than you know, and I believe in you completely. 💪`);
    } else if (userText.includes('tired') || userText.includes('exhausted')) {
      responses.push(`${context.name}, burnout is real, and acknowledging it shows incredible self-awareness 🧘‍♀️`);
      responses.push(`${context.todayHabits > 0 ? `Even tired, you completed ${context.todayHabits} habits today - that's resilience in action! 🌟` : 'Some days, just showing up is enough. Tomorrow is a fresh start. 🌅'}`);
      responses.push(`💡 Gentle suggestions:\n\n🛌 Prioritize rest - it's productive, not lazy\n🎯 Focus on just ONE thing today\n🧘‍♀️ Try a 3-minute breathing exercise\n💚 Practice self-compassion\n\nYou don't have to be "on" all the time. Rest is part of growth. 💤`);
    } else {
      responses.push(`${context.name}, I can feel your determination! 🌟 Asking for motivation shows you're committed to your growth.`);
      if (context.avgGoalProgress > 0) {
        responses.push(`Look at your progress: ${context.avgGoalProgress}% average on your goals! That's not luck - that's you showing up consistently. 📈`);
      }
      responses.push(`🔥 Remember why you started:\n\nEvery expert was once a beginner\nEvery pro was once an amateur\nEvery icon was once an unknown\n\nYou're building something beautiful, one day at a time. Keep going! 💪✨`);
    }
    
    return responses.join('\n\n');
  };

  // Helper function for progress analysis
  const generateProgressAnalysis = (context: any): string => {
    const analysis: string[] = [];
    
    analysis.push(`Let me give you a full picture of your amazing journey, ${context.name}! 📊✨`);
    
    // Goals analysis
    if (context.totalGoals > 0) {
      if (context.avgGoalProgress >= 80) {
        analysis.push(`🎯 Goals: EXCEPTIONAL (${context.avgGoalProgress}%)\nYou're absolutely crushing it! This level of progress puts you in the top 10% of goal achievers. 🏆`);
      } else if (context.avgGoalProgress >= 60) {
        analysis.push(`🎯 Goals: STRONG PROGRESS (${context.avgGoalProgress}%)\nSolid momentum! You're well above average and building great habits. 📈`);
      } else if (context.avgGoalProgress >= 30) {
        analysis.push(`� Goals: BUILDING MOMENTUM (${context.avgGoalProgress}%)\nYou're making real progress! Every percentage point represents effort and dedication. 💪`);
      } else {
        analysis.push(`🎯 Goals: GETTING STARTED (${context.avgGoalProgress}%)\nBeginnings are always the hardest part - you've already overcome that! 🌱`);
      }
    }
    
    // Habits analysis
    if (context.totalHabits > 0) {
      if (context.activeStreaks >= context.totalHabits * 0.8) {
        analysis.push(`🔥 Habits: MASTER LEVEL\n${context.activeStreaks}/${context.totalHabits} habits with active streaks! You've built incredible consistency. Longest streak: ${context.longestStreak} days! 👑`);
      } else if (context.activeStreaks > 0) {
        analysis.push(`🔥 Habits: STRONG FOUNDATION\n${context.activeStreaks}/${context.totalHabits} active streaks show you're building lasting change. Your ${context.longestStreak}-day record proves you can do this! 🌟`);
      } else {
        analysis.push(`🔥 Habits: FRESH START\nEvery habit journey starts with day one. You're setting up systems for long-term success! 🚀`);
      }
    }
    
    // Wellness analysis
    if (context.completedSessions > 0) {
      analysis.push(`🧘‍♀️ Mindfulness: ${context.completedSessions} sessions completed\nYou're investing in your mental wellness - this creates ripple effects in every area of life! 💚`);
    }
    
    // Today's performance
    if (context.todayHabits > 0) {
      analysis.push(`⭐ Today's Highlight\nYou've already completed ${context.todayHabits} habits today! This is how extraordinary lives are built - one day at a time. 🎉`);
    }
    
    analysis.push(`💡 Key Insight: You're not just tracking metrics - you're building the identity of someone who follows through. That's the real transformation happening here!`);
    
    return analysis.join('\n\n');
  };

  // Helper function for stress and anxiety responses
  const generateStressResponse = (context: any, userText: string): string => {
    const responses: string[] = [];
    
    responses.push(`${context.name}, I hear you, and what you're feeling is completely valid 💙`);
    
    if (userText.includes('anxiety') || userText.includes('anxious') || userText.includes('panic')) {
      responses.push(`Anxiety can feel overwhelming, but you have more power over it than you might think. Here are some proven techniques:`);
      responses.push(`🧘‍♀️ Immediate Relief:\n\n📱 5-4-3-2-1 Grounding - Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste\n🌬️ Box Breathing - Inhale 4, hold 4, exhale 4, hold 4 (repeat 5 times)\n💭 Reality Check - "Is this thought helpful right now? What would I tell a friend?"`);
    } else {
      responses.push(`Stress is your body's way of saying you care - it shows your commitment. Let's channel that energy positively:`);
      responses.push(`🎯 Stress Management Toolkit:\n\n⏰ Time blocking - Focus on ONE thing at a time\n🧘‍♀️ Micro-meditations - Just 2 minutes can reset your nervous system\n💪 Movement - Even a 5-minute walk changes your brain chemistry\n📝 Brain dump - Write down all your worries, then prioritize`);
    }
    
    if (context.completedSessions > 0) {
      responses.push(`I notice you've completed ${context.completedSessions} meditation sessions - that's building your resilience muscle! 🌟 Consider doing a short session when stress peaks.`);
    } else {
      responses.push(`💡 Quick start: Try our meditation section for guided sessions designed specifically for stress relief.`);
    }
    
    responses.push(`Remember: You've handled 100% of your difficult days so far. That's an incredible track record! 💪 What feels most helpful to try right now?`);
    
    return responses.join('\n\n');
  };

  // Helper function for sleep responses
  const generateSleepResponse = (context: any): string => {
    const responses: string[] = [];
    
    responses.push(`Sleep is one of the most powerful tools for wellness, ${context.name}! Let's optimize your rest 😴`);
    
    responses.push(`🌙 Sleep Optimization Strategy:\n\n⏰ Consistent Schedule - Same bedtime/wake time (even weekends!)\n📱 Digital Sunset - No screens 1 hour before bed\n🌡️ Cool Environment - 65-68°F is optimal\n☕ Caffeine Cutoff - None after 2 PM\n🧘‍♀️ Wind-down Ritual - 20 minutes of calm activities`);
    
    responses.push(`💤 Tonight's Action Plan:\n\n1. Set a phone alarm for 1 hour before desired bedtime\n2. Dim lights and do something calming (reading, gentle stretching)\n3. Try the "4-7-8" breathing technique: Inhale 4, hold 7, exhale 8\n4. If your mind races, keep a notebook by your bed for "worry dumps"`);
    
    if (context.completedSessions > 0) {
      responses.push(`Your ${context.completedSessions} meditation sessions are already building better sleep habits! Consider trying a sleep-focused meditation tonight. 🌟`);
    }
    
    responses.push(`💡 Remember: Good sleep isn't a luxury - it's essential maintenance for your body and mind. Quality sleep improves mood, focus, immune function, and decision-making. You deserve rest! 💚`);
    
    return responses.join('\n\n');
  };

  // Helper function for habit building responses
  const generateHabitResponse = (context: any, userText: string): string => {
    const responses: string[] = [];
    
    responses.push(`Habit building is a superpower, ${context.name}! Let's make this sustainable and enjoyable 🌟`);
    
    if (context.longestStreak > 0) {
      responses.push(`Your longest streak of ${context.longestStreak} days proves you have what it takes! 🔥 Let's build on that success.`);
    }
    
    if (userText.includes('stick to') || userText.includes('consistent') || userText.includes('fail')) {
      responses.push(`🎯 The Secret Formula for Lasting Habits:\n\n🔬 Start Ridiculously Small - 2 minutes is better than 20 minutes you won't do\n🔗 Habit Stacking - "After I [existing habit], I will [new habit]"\n🎉 Celebrate Immediately - Pump your fist, say "Yes!" or do a victory dance\n📍 Environment Design - Make good habits obvious, bad habits invisible`);
    } else {
      responses.push(`🏗️ Building Your Habit Architecture:\n\n✨ Make it Obvious - Visual cues and reminders\n💫 Make it Attractive - Pair with something you enjoy\n⚡ Make it Easy - Reduce friction to almost zero\n🎉 Make it Satisfying - Track progress and celebrate wins`);
    }
    
    if (context.activeStreaks > 0) {
      responses.push(`You currently have ${context.activeStreaks} active streaks - that's incredible momentum! 📈 Each day you show up, you're literally rewiring your brain for success.`);
    }
    
    responses.push(`💡 Identity-Based Habits: Instead of "I want to meditate," think "I am someone who prioritizes mental wellness." When you change your identity, behaviors naturally follow.`);
    
    responses.push(`What specific habit are you working on? I can help you create a personalized strategy! 🚀`);
    
    return responses.join('\n\n');
  };

  // ...existing code...

  return (
    <SafeAreaView style={[styles.container, user?.preferences.theme === 'dark' && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, user?.preferences.theme === 'dark' && styles.darkHeader, { paddingTop: safeAreaInsets.top + 10 }]}> 
        <Text style={[styles.title, user?.preferences.theme === 'dark' && styles.darkText]}>Progress & Calendar</Text>
        <TouchableOpacity onPress={() => setIsFocusMode(true)}
          style={{ position: 'absolute', right: 20, top: safeAreaInsets.top + 10 }}>
          <MaterialIcons name="do-not-disturb" size={28} color="#4ECDC4" />
        </TouchableOpacity>
        <Text style={[styles.subtitle, user?.preferences.theme === 'dark' && styles.darkSubText]}>Track your achievements and schedule</Text>
      </View>

      <ScrollView style={[styles.scrollView, user?.preferences.theme === 'dark' && styles.darkScrollView]} showsVerticalScrollIndicator={false}>
        {/* Ask Wellness Coach Button */}
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <TouchableOpacity
            style={{ backgroundColor: '#6366F1', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            onPress={() => setShowCoachModal(true)}
          >
            <MaterialIcons name="psychology" size={24} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Ask Wellness Coach</Text>
          </TouchableOpacity>
        </View>
        {/* Wellness Section */}
        <View style={[styles.section, user?.preferences.theme === 'dark' && styles.darkCard]}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Wellness</Text>
          <View style={[styles.summaryCard, user?.preferences.theme === 'dark' && styles.darkSummaryCard]}>
            {/* Heart Rate: Prefer Apple Health, fallback to Fitbit */}
            <View style={styles.summaryItem}>
              <MaterialIcons name="favorite" size={24} color="#E74C3C" />
              <Text style={[styles.summaryLabel, user?.preferences.theme === 'dark' && styles.darkSummaryLabel]}>Heart Rate</Text>
              <Text style={[styles.summaryValue, user?.preferences.theme === 'dark' && styles.darkSummaryValue]}>
                {appleHealth.heartRate ?? fitbit.heartRate ?? '--'} bpm
              </Text>
            </View>
            {/* Sleep: Prefer Apple Health, fallback to Fitbit */}
            <View style={styles.summaryItem}>
              <MaterialIcons name="hotel" size={24} color="#6366F1" />
              <Text style={[styles.summaryLabel, user?.preferences.theme === 'dark' && styles.darkSummaryLabel]}>Sleep</Text>
              <Text style={[styles.summaryValue, user?.preferences.theme === 'dark' && styles.darkSummaryValue]}>
                {appleHealth.sleep ?? fitbit.sleep ?? '--'} hrs
              </Text>
            </View>
            {/* Steps: Prefer Apple Health, fallback to Fitbit */}
            <View style={styles.summaryItem}>
              <MaterialIcons name="directions-walk" size={24} color="#95E1A3" />
              <Text style={[styles.summaryLabel, user?.preferences.theme === 'dark' && styles.darkSummaryLabel]}>Steps</Text>
              <Text style={[styles.summaryValue, user?.preferences.theme === 'dark' && styles.darkSummaryValue]}>
                {appleHealth.steps ?? fitbit.steps ?? '--'}
              </Text>
            </View>
          </View>
          {/* Connect Device Button */}
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <TouchableOpacity
              style={{ backgroundColor: '#4ECDC4', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 }}
              onPress={() => setShowConnectDeviceModal(true)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                Connect Device
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Overall Progress Summary */}
        <View style={[styles.section, user?.preferences.theme === 'dark' && styles.darkCard]}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Overall Progress</Text>
          <View style={[styles.summaryCard, user?.preferences.theme === 'dark' && styles.darkSummaryCard]}>
            <TouchableOpacity 
              style={styles.summaryItem}
              onPress={() => showInfo(`You have ${goals.length} active goals with an average progress of ${getTotalProgress}%`, 'Goals Overview')}
            >
              <MaterialIcons name="track-changes" size={24} color="#4ECDC4" />
              <Text style={[styles.summaryLabel, user?.preferences.theme === 'dark' && styles.darkSummaryLabel]}>Goals</Text>
              <Text style={[styles.summaryValue, user?.preferences.theme === 'dark' && styles.darkSummaryValue]}>{getTotalProgress}%</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.summaryItem}
              onPress={() => showInfo(`${memoizedStats.habitsWithStreaks} out of ${habits.length} habits have active streaks`, 'Habits Overview')}
            >
              <MaterialIcons name="timeline" size={24} color="#FF9999" />
              <Text style={[styles.summaryLabel, user?.preferences.theme === 'dark' && styles.darkSummaryLabel]}>Habits</Text>
              <Text style={[styles.summaryValue, user?.preferences.theme === 'dark' && styles.darkSummaryValue]}>{memoizedStats.habitsWithStreaks}/{habits.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.summaryItem}
              onPress={() => showInfo(`You have completed ${memoizedStats.completedSessions} meditation sessions. Keep up the great work!`, 'Meditation Sessions')}
            >
              <MaterialIcons name="spa" size={24} color="#95E1A3" />
              <Text style={[styles.summaryLabel, user?.preferences.theme === 'dark' && styles.darkSummaryLabel]}>Sessions</Text>
              <Text style={[styles.summaryValue, user?.preferences.theme === 'dark' && styles.darkSummaryValue]}>{memoizedStats.completedSessions}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Calendar with Reminders */}
        <View style={[styles.calendarSection, user?.preferences.theme === 'dark' && styles.darkCalendarSection]}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <MaterialIcons name="chevron-left" size={24} color={user?.preferences.theme === 'dark' ? '#F8FAFC' : '#2C3E50'} />
            </TouchableOpacity>
            <Text style={[styles.calendarMonth, user?.preferences.theme === 'dark' && styles.darkText]}>{getCurrentMonth()}</Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <MaterialIcons name="chevron-right" size={24} color={user?.preferences.theme === 'dark' ? '#F8FAFC' : '#2C3E50'} />
            </TouchableOpacity>
          </View>

          {/* Calendar Legend */}
          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9999' }]} />
              <Text style={[styles.legendText, user?.preferences.theme === 'dark' && styles.darkText]}>Habits</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4ECDC4' }]} />
              <Text style={[styles.legendText, user?.preferences.theme === 'dark' && styles.darkText]}>Meditation</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFE066' }]} />
              <Text style={[styles.legendText, user?.preferences.theme === 'dark' && styles.darkText]}>Reminders</Text>
            </View>
          </View>

          {/* Week Days */}
          <View style={styles.weekDays}>
            {getWeekDays().map((day, index) => (
              <Text key={index} style={[styles.weekDayText, user?.preferences.theme === 'dark' && styles.darkText]}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {generateCalendarDays().map((day, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.calendarDay, day && isToday(day) ? styles.todayCalendarDay : null, !day ? styles.emptyDay : null, user?.preferences.theme === 'dark' && styles.darkCalendarDay]}
                onPress={() => {
                  if (day) {
                    setSelectedDay(day);
                    setShowEventModal(true);
                  }
                }}
                disabled={!day}
              >
                {day && (
                  <>
                    <Text style={[styles.calendarDayText, isToday(day) && styles.todayCalendarDayText, user?.preferences.theme === 'dark' && styles.darkText]}>{day}</Text>
                    <View style={styles.eventDots}>
                      {hasHabitCompletion(day) && (
                        <View style={[styles.calendarDot, { backgroundColor: '#FF9999' }]} />
                      )}
                      {hasMeditationSession(day) && (
                        <View style={[styles.calendarDot, { backgroundColor: '#4ECDC4', left: 6 }]} />
                      )}
                      {hasReminder(day) && (
                        <View style={[styles.calendarDot, { backgroundColor: '#FFE066', left: 12 }]} />
                      )}
                    </View>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.addReminderButton}
            onPress={() => {
              if (selectedDay) {
                setShowAddReminderModal(true);
              } else {
                showError('Please select a day on the calendar before adding a reminder.', 'No Day Selected');
              }
            }}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.addReminderText}>Add Reminder</Text>
          </TouchableOpacity>
        </View>

        {/* Goals Progress */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Goals Progress</Text>
            <TouchableOpacity
              style={[styles.addButton, { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginLeft: 10 }, user?.preferences.theme === 'dark' && styles.darkAddButton]}
              onPress={() => setShowAddGoalModal(true)}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6 }}>Add Goal</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressCards}>
            {goals.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 24 }}>
                <MaterialIcons name="track-changes" size={40} color="#BDC3C7" />
                <Text style={{ color: '#BDC3C7', marginTop: 8 }}>No goals yet. Add your first goal!</Text>
              </View>
            ) : (
              goals.map((goal) => (
                <View 
                  key={goal.id} 
                  style={[styles.progressCard, user?.preferences.theme === 'dark' && styles.darkProgressCard]}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => handleGoalPress(goal)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.progressHeader}>
                      <View style={styles.goalInfo}>
                        <Text style={[styles.progressLabel, user?.preferences.theme === 'dark' && styles.darkText]}>{goal.name}</Text>
                        <Text style={[styles.goalDescription, user?.preferences.theme === 'dark' && styles.darkSubText]}>{goal.description}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={16} color="#BDC3C7" />
                    </View>
                    <View style={styles.progressContainer}>
                      <TouchableOpacity 
                        style={[styles.progressCircle, { backgroundColor: goal.color + '20' }, user?.preferences.theme === 'dark' && { borderColor: '#4ECDC4', borderWidth: 1 }]}
                        onPress={() => incrementGoalProgress(goal.id)}
                      >
                        <Text style={[styles.progressPercentage, { color: goal.color }, user?.preferences.theme === 'dark' && { color: '#4ECDC4' }]}> 
                          {Math.round(goal.progress)}%
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#FFF5F5', borderRadius: 16, padding: 6 }}
                    onPress={() => handleDeleteGoal(goal.id)}
                  >
                    <MaterialIcons name="delete" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      {/* Add Goal Modal */}
      <Modal
        visible={showAddGoalModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, user?.preferences.theme === 'dark' && styles.darkModalHeader]}>
              <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Add New Goal</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddGoalModal(false)}
              >
                <MaterialIcons name="close" size={24} color={user?.preferences.theme === 'dark' ? '#F8FAFC' : '#BDC3C7'} />
              </TouchableOpacity>
            </View>
            <View style={[styles.reminderForm, user?.preferences.theme === 'dark' && styles.darkReminderForm]}>
              <Text style={[styles.inputLabel, user?.preferences.theme === 'dark' && styles.darkText]}>Goal Name</Text>
              <TextInput
                style={[styles.textInput, user?.preferences.theme === 'dark' && styles.darkTextInput]}
                value={newGoalName}
                onChangeText={setNewGoalName}
                placeholder="Enter goal name"
                placeholderTextColor={user?.preferences.theme === 'dark' ? '#CCCCCC' : '#BDC3C7'}
              />
              <Text style={[styles.inputLabel, user?.preferences.theme === 'dark' && styles.darkText]}>Description</Text>
              <TextInput
                style={[styles.textInput, user?.preferences.theme === 'dark' && styles.darkTextInput]}
                value={newGoalDescription}
                onChangeText={setNewGoalDescription}
                placeholder="Enter description"
                placeholderTextColor={user?.preferences.theme === 'dark' ? '#CCCCCC' : '#BDC3C7'}
              />
              <Text style={[styles.inputLabel, user?.preferences.theme === 'dark' && styles.darkText]}>Target (%)</Text>
              <TextInput
                style={[styles.textInput, user?.preferences.theme === 'dark' && styles.darkTextInput]}
                value={String(newGoalTarget)}
                onChangeText={v => setNewGoalTarget(Number(v))}
                placeholder="100"
                placeholderTextColor={user?.preferences.theme === 'dark' ? '#CCCCCC' : '#BDC3C7'}
                keyboardType="numeric"
              />
              <Text style={[styles.inputLabel, user?.preferences.theme === 'dark' && styles.darkText]}>Type</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                {['weekly', 'monthly', 'daily'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={{ padding: 8, borderRadius: 8, backgroundColor: newGoalType === type ? '#4ECDC4' : '#F0F0F0' }}
                    onPress={() => setNewGoalType(type as any)}
                  >
                    <Text style={{ color: newGoalType === type ? 'white' : '#333', fontWeight: '600' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.inputLabel, user?.preferences.theme === 'dark' && styles.darkText]}>Color</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                {['#4ECDC4', '#FF9999', '#FFE066', '#95E1A3', '#6366F1'].map(color => (
                  <TouchableOpacity
                    key={color}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color, borderWidth: newGoalColor === color ? 2 : 0, borderColor: '#333', marginRight: 8 }}
                    onPress={() => setNewGoalColor(color)}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={[styles.addButton, user?.preferences.theme === 'dark' && styles.darkAddButton, isAddingGoal && { opacity: 0.6 }]}
                onPress={handleAddGoal}
                disabled={isAddingGoal}
              >
                <Text style={styles.addButtonText}>Add Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

        {/* Connect Device Modal */}
        <Modal
        visible={showConnectDeviceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConnectDeviceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, user?.preferences.theme === 'dark' && styles.darkModalHeader]}>
              <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Connect Your Device</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowConnectDeviceModal(false)}
              >
                <MaterialIcons name="close" size={24} color={user?.preferences.theme === 'dark' ? '#F8FAFC' : '#BDC3C7'} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 16, marginBottom: 12 }}>
                To view your real wellness data, please connect your device:
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: '#6366F1', padding: 12, borderRadius: 12, marginBottom: 12 }}
                onPress={handleConnectFitbit}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Connect Fitbit</Text>
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={{ backgroundColor: '#23272F', padding: 12, borderRadius: 12 }}
                  onPress={() => {/* TODO: Add Apple Health permissions flow here */}}
                >
                  <Text style={{ color: '#4ECDC4', fontWeight: 'bold', fontSize: 16 }}>Connect Apple Health</Text>
                </TouchableOpacity>
              )}
              <Text style={{ marginTop: 20, color: '#7F8C8D' }}>
                Device linking is secure and private. Your data will only be used to show your wellness stats in the app.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

        {/* Active Habits */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Active Habits</Text>
          
          <View style={styles.habitsGrid}>
            {habits.map((habit) => (
              <TouchableOpacity 
                key={habit.id} 
                style={[styles.habitCard, { backgroundColor: habit.color + '15' }, user?.preferences.theme === 'dark' && styles.darkHabitCard]} 
                onPress={() => toggleHabitForDay(habit.id, new Date().getDate())}
              >
                <View style={[styles.habitIcon, { backgroundColor: habit.color }]}> 
                  <MaterialIcons name={habit.icon as any} size={20} color="white" />
                </View>
                <Text style={[styles.habitName, user?.preferences.theme === 'dark' && styles.darkText]}>{habit.name}</Text>
                <Text style={[styles.habitStreak, user?.preferences.theme === 'dark' && styles.darkSubText]}>{habit.streak} day streak</Text>
                <Text style={[styles.habitStatus, user?.preferences.theme === 'dark' && { color: '#4ECDC4' }]}>
                  {habit.completedDates.includes(new Date().toISOString().split('T')[0]) ? '✓ Completed' : 'Tap to complete'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* This Week's Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>This Week's Summary</Text>
          <View style={[styles.weekSummary, user?.preferences.theme === 'dark' && styles.darkWeekSummary]}>
            <TouchableOpacity 
              style={[styles.summaryRow, user?.preferences.theme === 'dark' && styles.darkSummaryRow]}
              onPress={() => {
                showInfo(`You have completed ${memoizedStats.totalHabitsToday} out of ${habits.length} habits today. ${memoizedStats.totalHabitsToday === habits.length ? '🎉 Perfect day!' : 'Keep going!'}`, 'Today\'s Habits');
              }}
            >
              <Text style={[styles.summaryLabel, user?.preferences.theme === 'dark' && styles.darkSummaryLabel]}>Habits Completed</Text>
              <Text style={[styles.summaryValue, user?.preferences.theme === 'dark' && styles.darkSummaryValue]}>
                {memoizedStats.totalHabitsToday} / {habits.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.summaryRow, user?.preferences.theme === 'dark' && styles.darkSummaryRow]}
              onPress={() => showInfo(`Your average goal completion is ${getTotalProgress}%. ${getTotalProgress >= 80 ? 'Excellent progress!' : getTotalProgress >= 50 ? 'Good progress!' : 'Keep working towards your goals!'}`, 'Goals Progress')}
            >
              <Text style={[styles.summaryLabel, user?.preferences.theme === 'dark' && styles.darkSummaryLabel]}>Goals Average</Text>
              <Text style={[styles.summaryValue, user?.preferences.theme === 'dark' && styles.darkSummaryValue]}>{getTotalProgress}%</Text>
            </TouchableOpacity>
                        <TouchableOpacity 
              style={[styles.summaryRow, user?.preferences.theme === 'dark' && styles.darkSummaryRow]}
              onPress={() => {
                const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak)) : 0;
                const bestHabit = habits.find(h => h.longestStreak === bestStreak);
                showInfo(`Your longest streak is ${bestStreak} days${bestHabit ? ` for "${bestHabit.name}"` : ''}! 🔥`, 'Best Streak');
              }}
            >
              <Text style={[styles.summaryLabel, user?.preferences.theme === 'dark' && styles.darkSummaryLabel]}>Best Streak</Text>
              <Text style={[styles.summaryValue, user?.preferences.theme === 'dark' && styles.darkSummaryValue]}>
                {habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak)) : 0} days
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Focus Mode Overlay */}
      {isFocusMode && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#23272F',
          opacity: 0.98,
          zIndex: 9999,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <StatusBar hidden />
          <Text style={{ color: '#4ECDC4', fontSize: 28, fontWeight: 'bold', marginBottom: 24 }}>Focus Mode</Text>
          <Text style={{ color: '#F8FAFC', fontSize: 18, textAlign: 'center', marginBottom: 32, paddingHorizontal: 24 }}>
            All app features and notifications are disabled. For full device lock, enable Guided Access (iOS) or Screen Pinning (Android) from your phone settings.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#E74C3C', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 32 }}
            onPress={() => setIsFocusMode(false)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>Exit Focus Mode</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Event Details Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
          <View style={[styles.modalHeader, user?.preferences.theme === 'dark' && styles.darkModalHeader]}>
            <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>
              Events for {selectedDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDay}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowEventModal(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={user?.preferences.theme === 'dark' ? '#F8FAFC' : '#666'} />
            </TouchableOpacity>
          </View>
            
            <ScrollView style={styles.modalScroll}>
              {selectedDay && getEventsForDay(selectedDay).length > 0 ? (
                getEventsForDay(selectedDay).map((event, index) => (
                  <View key={index} style={[styles.eventItem, { backgroundColor: event.color + '15' }]}>
                    <View style={[styles.eventIcon, { backgroundColor: event.color }]}>
                      <MaterialIcons name={event.icon as any} size={20} color="white" />
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>
                        {event.title}
                        {event.time && ` - ${event.time}`}
                      </Text>
                      <Text style={styles.eventType}>{event.type}</Text>
                    </View>
                    {event.type === 'reminder' && event.id && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteReminder(event.id!)}
                      >
                        <MaterialIcons name="delete" size={20} color="#E74C3C" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.noEvents}>
                  <MaterialIcons name="event-busy" size={48} color="#BDC3C7" />
                  <Text style={styles.noEventsText}>No events for this day</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddReminderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddReminderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, user?.preferences.theme === 'dark' && styles.darkModalHeader]}>
              <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Add Reminder</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddReminderModal(false)}
              >
                <MaterialIcons name="close" size={24} color={user?.preferences.theme === 'dark' ? '#F8FAFC' : '#BDC3C7'} />
              </TouchableOpacity>
            </View>

          <View style={[styles.reminderForm, user?.preferences.theme === 'dark' && styles.darkReminderForm]}>
            <Text style={[styles.inputLabel, user?.preferences.theme === 'dark' && styles.darkText]}>Reminder Title</Text>
            <TextInput
              style={[styles.textInput, user?.preferences.theme === 'dark' && styles.darkTextInput]}
              value={reminderTitle}
              onChangeText={setReminderTitle}
              placeholder="Enter reminder title"
              placeholderTextColor={user?.preferences.theme === 'dark' ? '#CCCCCC' : '#BDC3C7'}
            />

            <Text style={[styles.inputLabel, user?.preferences.theme === 'dark' && styles.darkText]}>Time (HH:MM)</Text>
            <TextInput
              style={[styles.textInput, user?.preferences.theme === 'dark' && styles.darkTextInput]}
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="09:00"
              placeholderTextColor={user?.preferences.theme === 'dark' ? '#CCCCCC' : '#BDC3C7'}
            />

            <TouchableOpacity
              style={[styles.addButton, user?.preferences.theme === 'dark' && styles.darkAddButton]}
              onPress={addReminder}
            >
              <Text style={styles.addButtonText}>Add Reminder</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </Modal>

      {/* Goal Update Modal */}
      <Modal
        visible={showGoalUpdateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGoalUpdateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Goal Progress</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowGoalUpdateModal(false)}
              >
                <MaterialIcons name="close" size={24} color="#BDC3C7" />
              </TouchableOpacity>
            </View>

            {selectedGoal && (
          <View style={[styles.reminderForm, user?.preferences.theme === 'dark' && styles.darkReminderForm]}>
            <Text style={[styles.goalModalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>{selectedGoal.name}</Text>
            <Text style={[styles.goalModalDescription, user?.preferences.theme === 'dark' && styles.darkSubText]}>{selectedGoal.description}</Text>
            
            <Text style={[styles.inputLabel, user?.preferences.theme === 'dark' && styles.darkText]}>Current Progress: {Math.round(selectedGoal.progress)}%</Text>
            
            <Text style={[styles.inputLabel, user?.preferences.theme === 'dark' && styles.darkText]}>New Progress (0-100)</Text>
            <TextInput
              style={[styles.textInput, user?.preferences.theme === 'dark' && styles.darkTextInput]}
              value={goalProgressInput}
              onChangeText={setGoalProgressInput}
              placeholder="Enter progress percentage"
              placeholderTextColor={user?.preferences.theme === 'dark' ? '#CCCCCC' : '#BDC3C7'}
              keyboardType="numeric"
            />

            <View style={styles.quickProgressButtons}>
              <TouchableOpacity
                style={[styles.quickButton, { backgroundColor: '#FF9999' }]} 
                onPress={() => setGoalProgressInput('25')}
              >
                <Text style={styles.quickButtonText}>25%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickButton, { backgroundColor: '#FFE066' }]} 
                onPress={() => setGoalProgressInput('50')}
              >
                <Text style={styles.quickButtonText}>50%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickButton, { backgroundColor: '#95E1A3' }]} 
                onPress={() => setGoalProgressInput('75')}
              >
                <Text style={styles.quickButtonText}>75%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickButton, { backgroundColor: '#4ECDC4' }]} 
                onPress={() => setGoalProgressInput('100')}
              >
                <Text style={styles.quickButtonText}>100%</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.addButton, user?.preferences.theme === 'dark' && styles.darkAddButton]}
              onPress={updateGoalProgressValue}
            >
              <Text style={styles.addButtonText}>Update Progress</Text>
            </TouchableOpacity>
          </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Wellness Coach Modal */}
      <Modal
        visible={showCoachModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCoachModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '100%', padding: 0 }]}> 
            <View style={[
              styles.modalHeader,
              user?.preferences.theme === 'dark' && styles.darkModalHeader,
              { borderTopLeftRadius: 20, borderTopRightRadius: 20 }
            ]}>
              <Text style={[
                styles.modalTitle,
                user?.preferences.theme === 'dark' && styles.darkText
              ]}>Wellness Coach</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCoachModal(false)}
              >
                <MaterialIcons name="close" size={24} color={user?.preferences.theme === 'dark' ? '#F8FAFC' : '#BDC3C7'} />
              </TouchableOpacity>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: user?.preferences.theme === 'dark' ? '#23272F' : '#F8F8F8',
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              padding: 0
            }}>
              <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
                {coachMessages.map((msg, idx) => (
                  <View key={idx} style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    marginVertical: 6,
                    maxWidth: '80%',
                  }}>
                    <Text style={{
                      backgroundColor: msg.sender === 'user' ? '#4ECDC4' : '#6366F1',
                      color: 'white',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 18,
                      fontSize: 16,
                      shadowColor: '#000',
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 2 },
                    }}>{msg.text}</Text>
                  </View>
                ))}
                {isCoachLoading && (
                  <Text style={{ color: '#6366F1', fontStyle: 'italic', marginTop: 8, alignSelf: 'flex-start' }}>Coach is typing...</Text>
                )}
                
                {/* Quick Action Buttons for Common Queries */}
                {coachMessages.length === 1 && (
                  <View style={{ marginTop: 20, marginBottom: 10 }}>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: '600', 
                      color: user?.preferences.theme === 'dark' ? '#CCCCCC' : '#666',
                      marginBottom: 12,
                      textAlign: 'center'
                    }}>Quick Questions:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {[
                        { text: "I'm feeling stressed", emoji: "😰" },
                        { text: "How to sleep better?", emoji: "😴" },
                        { text: "Need motivation", emoji: "💪" },
                        { text: "Building habits", emoji: "🎯" },
                        { text: "Meditation tips", emoji: "🧘" },
                        { text: "Healthy eating", emoji: "🥗" }
                      ].map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          style={{
                            backgroundColor: user?.preferences.theme === 'dark' ? '#374151' : '#F3F4F6',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: user?.preferences.theme === 'dark' ? '#4B5563' : '#E5E7EB'
                          }}
                          onPress={() => {
                            setCoachInput(item.text);
                            // Auto-send the message after a short delay
                            setTimeout(() => {
                              const userMsg = { sender: 'user', text: item.text };
                              setCoachMessages(prev => [...prev, userMsg]);
                              setCoachInput('');
                              setIsCoachLoading(true);
                              getCoachAnswer(item.text).then(response => {
                                setCoachMessages(prev => [...prev, { sender: 'coach', text: response }]);
                                setIsCoachLoading(false);
                              }).catch(() => {
                                setCoachMessages(prev => [...prev, { sender: 'coach', text: 'I apologize for the technical issue. Could you try rephrasing your question?' }]);
                                setIsCoachLoading(false);
                              });
                            }, 100);
                          }}
                        >
                          <Text style={{ 
                            color: user?.preferences.theme === 'dark' ? '#E5E7EB' : '#374151',
                            fontSize: 13,
                            fontWeight: '500'
                          }}>
                            {item.emoji} {item.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderTopWidth: 1,
                borderColor: user?.preferences.theme === 'dark' ? '#333' : '#E0E0E0',
                backgroundColor: user?.preferences.theme === 'dark' ? '#23272F' : '#F8F8F8',
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20
              }}>
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: user?.preferences.theme === 'dark' ? '#23272F' : '#F0F0F0',
                    color: user?.preferences.theme === 'dark' ? '#F8FAFC' : '#333',
                    borderRadius: 16,
                    padding: 12,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: user?.preferences.theme === 'dark' ? '#333' : '#E0E0E0'
                  }}
                  value={coachInput}
                  onChangeText={setCoachInput}
                  placeholder="Type your question..."
                  placeholderTextColor={user?.preferences.theme === 'dark' ? '#CCCCCC' : '#BDC3C7'}
                  editable={!isCoachLoading}
                  returnKeyType="send"
                  onSubmitEditing={sendCoachMessage}
                />
                <TouchableOpacity
                  style={{ backgroundColor: '#4ECDC4', padding: 12, borderRadius: 16, marginLeft: 8 }}
                  onPress={sendCoachMessage}
                  disabled={isCoachLoading}
                >
                  <MaterialIcons name="send" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Toast {...toast} onHide={() => {}} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  darkSummaryCard: {
    backgroundColor: '#23272F',
    borderRadius: 15,
  },
  darkProgressCard: {
    backgroundColor: '#23272F',
    borderRadius: 15,
  },
  darkHabitCard: {
    backgroundColor: '#23272F',
    borderRadius: 12,
  },
  darkSummaryRow: {
    borderBottomColor: '#333',
  },
  darkModalHeader: {
    backgroundColor: '#23272F',
    borderBottomColor: '#333',
  },
  darkReminderForm: {
    backgroundColor: '#23272F',
  },
  darkTextInput: {
    backgroundColor: '#23272F',
    color: '#F8FAFC',
    borderColor: '#333',
  },
  darkAddButton: {
    backgroundColor: '#6366F1',
  },
  darkHeader: {
    backgroundColor: '#1A1A1A',
  },
  darkScrollView: {
    backgroundColor: '#1A1A1A',
  },
  darkCalendarSection: {
    backgroundColor: '#23272F',
    borderRadius: 18,
  },
  darkCalendarDay: {
    backgroundColor: '#23272F',
    borderColor: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  darkSummaryLabel: {
    color: '#FFFFFF',
  },
  darkSummaryValue: {
    color: '#4ECDC4',
  },

  // Goals Progress
  progressCards: {
    gap: 15,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  progressContainer: {
    marginLeft: 20,
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Habits Grid
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  habitCard: {
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  habitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  habitStreak: {
    fontSize: 12,
    color: '#666',
  },
  habitStatus: {
    fontSize: 10,
    color: '#4ECDC4',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Calendar Section
  calendarSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    width: 35,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: (width - 80) / 7,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 5,
  },
  todayCalendarDay: {
    backgroundColor: '#4ECDC4',
    borderRadius: 22,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  todayCalendarDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 8,
  },

  // Week Summary
  weekSummary: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkWeekSummary: {
    backgroundColor: '#23272F',
    borderRadius: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 5,
  },
  modalScroll: {
    maxHeight: 400,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  eventType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  noEvents: {
    alignItems: 'center',
    padding: 40,
  },
  noEventsText: {
    fontSize: 16,
    color: '#BDC3C7',
    marginTop: 10,
  },

  // Legacy styles removed
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  taskCard: {
    backgroundColor: '#667eea',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  taskParticipants: {
    flexDirection: 'row',
    gap: 5,
  },
  participant: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  taskDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  streakTitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  streakDays: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 20,
  },
  editHabitButton: {
    backgroundColor: '#FF9999',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  editHabitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    alignItems: 'center',
    padding: 5,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
  },
   goalModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendText: {
    fontSize: 14,
    color: '#23272F',
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyDay: {
    backgroundColor: 'transparent',
    opacity: 0.5,
  },
  eventDots: {
    flexDirection: 'row',
    marginTop: 2,
    height: 8,
    alignItems: 'center',
  },
  addReminderButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'center',
  },
  addReminderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  reminderForm: {
    padding: 16,
    gap: 10,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#23272F',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#23272F',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  goalModalDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
    textAlign: 'center',
  },
  quickProgressButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProgressScreen;
