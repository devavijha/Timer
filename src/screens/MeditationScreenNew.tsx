import React, { useState, useEffect, useRef, useCallback } from 'react';
import { saveMeditationData, loadMeditationData } from '../utils/storage';
// ...existing code...
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated, 
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CircularProgress } from 'react-native-circular-progress';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeArea } from 'react-native-safe-area-context';
import { useAppSelector } from '../hooks/redux';
import { 
  startSession, 
  stopSession, 
  completeSession, 
  updateTimer, 
  addProgress, 
  setActiveDate 
} from '../store/meditationSlice';
import type { MeditationSession } from '../types/meditation';
import { useAudioPlayer, AudioSource } from 'expo-audio';
import { createAudioSourceFromRequire, debugAudioSource } from '../utils/audioUtils';
import { setupProductionAudio } from '../utils/productionAudioSetup';
// Modern audio implementation for meditation sounds

const { width } = Dimensions.get('window');

// Simple soundscape definitions with local music files
const SOUNDSCAPES = [
  {
    id: 'focus',
    name: 'Focus',
    description: 'Boosts your productivity by helping you concentrate for longer',
    color: '#FF6B6B',
    icon: 'graphic-eq',
    musicFile: require('../Music/meditation-159124.mp3')
  },
  {
    id: 'relax',
    name: 'Relax', 
    description: 'Calms your mind to create feelings of comfort and safety',
    color: '#4ECDC4',
    icon: 'graphic-eq',
    musicFile: require('../Music/meditation-amp-relax-238980.mp3')
  },
  {
    id: 'sleep',
    name: 'Sleep',
    description: 'Soothes you into a deep sleep with soft, gentle sounds',
    color: '#6C5CE7',
    icon: 'graphic-eq',
    musicFile: require('../Music/deep-sleep-308846.mp3')
  },
  {
    id: 'activity',
    name: 'Activity',
    description: 'Powers your movement with sounds to keep you present and grounded',
    color: '#00B894',
    icon: 'graphic-eq',
    musicFile: require('../Music/yoga-meditation-252461.mp3')
  }
];

// Practice-specific music files
const PRACTICE_MUSIC = {
  'morning': {
    name: 'Morning Energy',
    musicFile: require('../Music/meditation-159124.mp3'), // Focus music for morning
    color: '#FFD93D'
  },
  'focus': {
    name: 'Deep Focus',
    musicFile: require('../Music/meditation-159124.mp3'), // Focus music
    color: '#FF6B6B'
  },
  'breath': {
    name: 'Breathing Calm',
    musicFile: require('../Music/meditation-amp-relax-238980.mp3'), // Relaxation music
    color: '#4ECDC4'
  },
  'evening': {
    name: 'Sleep Sounds',
    musicFile: require('../Music/deep-sleep-308846.mp3'), // Sleep music
    color: '#6C5CE7'
  }
};

// Mock biometric data
const MOCK_BIOMETRICS = {
  heartRate: Math.floor(60 + Math.random() * 40),
  stressLevel: Math.floor(1 + Math.random() * 10),
  energyLevel: Math.floor(1 + Math.random() * 10),
  circadianPhase: Math.random(),
  timeOfDay: new Date().getHours() > 12 ? 'evening' : 'morning'
};

// Motivational quotes for meditation
const MOTIVATIONAL_QUOTES = [
  {
    id: 1,
    quote: "The mind is everything. What you think you become.",
    author: "Buddha",
    gradient: ['#667eea', '#764ba2']
  },
  {
    id: 2,
    quote: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    gradient: ['#f093fb', '#f5576c']
  },
  {
    id: 3,
    quote: "Meditation is not about stopping thoughts, but recognizing that we are more than our thoughts and our feelings.",
    author: "Arianna Huffington",
    gradient: ['#4facfe', '#00f2fe']
  },
  {
    id: 4,
    quote: "Wherever you are, be there totally.",
    author: "Eckhart Tolle",
    gradient: ['#43e97b', '#38f9d7']
  },
  {
    id: 5,
    quote: "The present moment is the only time over which we have dominion.",
    author: "Thích Nhất Hạnh",
    gradient: ['#fa709a', '#fee140']
  },
  {
    id: 6,
    quote: "Meditation is a way for nourishing and blossoming the divinity within you.",
    author: "Amit Ray",
    gradient: ['#a8edea', '#fed6e3']
  },
  {
    id: 7,
    quote: "Your goal is not to battle with the mind, but to witness the mind.",
    author: "Swami Muktananda",
    gradient: ['#ff9a9e', '#fecfef']
  },
  {
    id: 8,
    quote: "In the silence of love you will find the spark of life.",
    author: "Rumi",
    gradient: ['#a1c4fd', '#c2e9fb']
  }
];

const MeditationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { sessions, currentSession, isActive, timeRemaining } = useSelector(
    (state: any) => state.meditation
  );
  const { user } = useAppSelector((state) => state.user);
  const safeAreaInsets = useSafeArea();
  
  // Simple state for music player
  const [showTimer, setShowTimer] = useState(false);
  const audioPlayer = useAudioPlayer();
  const [currentAudioSource, setCurrentAudioSource] = useState<AudioSource | null>(null);
  const [currentSoundscape, setCurrentSoundscape] = useState<string | null>(null);
  const [currentPractice, setCurrentPractice] = useState<string | null>(null); // Track active practice
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundscapeFeedback, setSoundscapeFeedback] = useState<string>('');
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [showBiometrics, setShowBiometrics] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Quote slideshow state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const quoteOpacity = useRef(new Animated.Value(1)).current;
  const quoteScale = useRef(new Animated.Value(1)).current;

  // Daily Practice State
  const [dailyPractices, setDailyPractices] = useState([
    { id: 'morning', name: 'Morning Mindfulness', duration: '5 min', icon: 'wb-sunny', color: '#FFD93D', completed: false, completedAt: null as Date | null },
    { id: 'focus', name: 'Focus Builder', duration: '10 min', icon: 'center-focus-weak', color: '#FF6B6B', completed: false, completedAt: null as Date | null },
    { id: 'breath', name: 'Breath Awareness', duration: '7 min', icon: 'waves', color: '#4ECDC4', completed: false, completedAt: null as Date | null },
    { id: 'evening', name: 'Evening Calm', duration: '15 min', icon: 'nights-stay', color: '#6C5CE7', completed: false, completedAt: null as Date | null }
  ]);
  const [streakCount, setStreakCount] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  // Guided Meditation Timer Modal State
  const [showGuidedTimerModal, setShowGuidedTimerModal] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [guidedTimerMinutes, setGuidedTimerMinutes] = useState(10);
  // Keep track of practice completion timeouts
  const practiceTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Memoized save function to prevent infinite loops
  const savePracticeData = useCallback(() => {
    const dataToSave = {
      streakCount,
      weeklyMinutes,
      totalMinutes,
      completedToday: dailyPractices.filter(p => p.completed).map(p => p.id),
      lastUpdated: new Date().toISOString()
    };
    saveMeditationData(dataToSave);
    console.log('Saving practice data:', dataToSave);
  }, [streakCount, weeklyMinutes, totalMinutes, dailyPractices]);

  // Calculate current elapsed time from timeRemaining
  const currentTime = currentSession ? (currentSession.duration * 60) - timeRemaining : 0;

  // Load daily practice data
  useEffect(() => {
    loadDailyPracticeData();
    checkForNewDay();
  }, []);

  const checkForNewDay = () => {
    const today = new Date().toDateString();
    // const lastActiveDate = await AsyncStorage.getItem('lastActiveDate'); // Use AsyncStorage in React Native
    
    // For now, we'll skip the check - in real app would compare dates
    // if (lastActiveDate !== today) {
    //   // New day - reset daily practices
    //   setDailyPractices(prev => prev.map(practice => ({
    //     ...practice,
    //     completed: false,
    //     completedAt: null
    //   })));
    //   
    //   // Save new date
    //   // AsyncStorage.setItem('lastActiveDate', today);
    // }
  };

  const loadDailyPracticeData = () => {
    loadMeditationData().then((savedData) => {
      if (savedData) {
        setStreakCount(savedData.streakCount || 0);
        setWeeklyMinutes(savedData.weeklyMinutes || 0);
        setTotalMinutes(savedData.totalMinutes || 0);
        setDailyPractices(prev => prev.map(practice => ({
          ...practice,
          completed: savedData.completedToday?.includes(practice.id) || false,
          completedAt: savedData.completedToday?.includes(practice.id) ? new Date() : null
        })));
      } else {
        // No saved data, start fresh
        setStreakCount(0);
        setWeeklyMinutes(0);
        setTotalMinutes(0);
        setDailyPractices(prev => prev.map(practice => ({
          ...practice,
          completed: false,
          completedAt: null
        })));
      }
    });
  };

  const completePractice = (practiceId: string) => {
    const practice = dailyPractices.find(p => p.id === practiceId);
    if (!practice || practice.completed) return;

    const practiceMinutes = parseInt(practice.duration.split(' ')[0]);
    
    setDailyPractices(prev => prev.map(p => 
      p.id === practiceId 
        ? { ...p, completed: true, completedAt: new Date() }
        : p
    ));

    // Update stats
    setWeeklyMinutes(prev => prev + practiceMinutes);
    setTotalMinutes(prev => prev + practiceMinutes);

    // Check if this completes the day and should update streak
    const updatedPractices = dailyPractices.map(p => 
      p.id === practiceId ? { ...p, completed: true } : p
    );
    const completedToday = updatedPractices.filter(p => p.completed).length;
    
    // If user completes at least 2 practices, count as a day for streak
    if (completedToday >= 2 && dailyPractices.filter(p => p.completed).length < 2) {
      setStreakCount(prev => prev + 1);
    }

    // Show minimal feedback
    setSoundscapeFeedback(`✅ +${practiceMinutes} min`);
    setTimeout(() => setSoundscapeFeedback(''), 1500);

    // Save to storage (in real app)
    savePracticeData();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    // Helper to play notification sound
    const playNotifySound = async () => {
      try {
        const { Audio } = await import('expo-av');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          interruptionModeIOS: 1,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          playThroughEarpieceAndroid: false,
        });
        const notifySound = require('../../../assets/notify.mp3');
        const { sound } = await Audio.Sound.createAsync(notifySound);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (
            status.isLoaded &&
            typeof status.positionMillis === 'number' &&
            typeof status.durationMillis === 'number' &&
            status.positionMillis >= status.durationMillis
          ) {
            sound.unloadAsync();
          }
        });
      } catch (err) {
        console.error('Failed to play notify.mp3:', err);
      }
    };

    if (isActive && currentSession) {
      interval = setInterval(() => {
        if (timeRemaining > 0) {
          dispatch(updateTimer(timeRemaining - 1));
        } else {
          clearInterval(interval);
          // Play sound after timer ends, before state changes
          playNotifySound().then(() => {
            dispatch(completeSession());
            setShowTimer(false);
            // Don't automatically stop soundscapes when session ends
            // Let users manually control their background music
            // Update practice stats when session completes
            if (currentSession) {
              const sessionMinutes = currentSession.duration;
              setWeeklyMinutes(prev => prev + sessionMinutes);
              setTotalMinutes(prev => prev + sessionMinutes);
              // Save updated data
              savePracticeData();
            }
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, currentSession, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    // Set up Audio mode for production APK
    setupProductionAudio();
    // Audio mode is automatically handled by expo-audio
    console.log('Audio setup completed');

    return () => {
      stopAllSounds();
      // Clear all practice timeouts
      Object.values(practiceTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      practiceTimeouts.current = {};
    };
  }, []);

  const stopAllSounds = async () => {
    try {
      if (currentAudioSource) {
        audioPlayer.pause();
        setCurrentAudioSource(null);
      }
      setCurrentSoundscape(null);
      setCurrentPractice(null); // Reset practice state
      setIsPlaying(false);
      
      // Clear all practice timeouts when stopping sounds
      Object.values(practiceTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      practiceTimeouts.current = {};
    } catch (error) {
      console.error('Error stopping sounds:', error);
    }
  };

  // Fade in animation when timer is shown
  useEffect(() => {
    if (showTimer) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [showTimer, fadeAnim]);

  // Pulse animation when music is playing
  useEffect(() => {
    if (isPlaying) {
      const startPulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isPlaying) startPulse();
        });
      };
      startPulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, pulseAnim]);

  // Quote slideshow animation
  useEffect(() => {
    const slideInterval = setInterval(() => {
      // Fade out current quote
      Animated.parallel([
        Animated.timing(quoteOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(quoteScale, {
          toValue: 0.95,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Change quote
        setCurrentQuoteIndex((prevIndex) => 
          prevIndex === MOTIVATIONAL_QUOTES.length - 1 ? 0 : prevIndex + 1
        );
        
        // Fade in new quote
        Animated.parallel([
          Animated.timing(quoteOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(quoteScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        ]).start();
      });
    }, 4000); // Change quote every 4 seconds

    return () => clearInterval(slideInterval);
  }, [quoteOpacity, quoteScale]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!currentSession) return 0;
    return (currentTime / (currentSession.duration * 60)) * 100;
  };

  // Enhanced Endel functions
  const playSoundscape = async (soundscapeId: string) => {
    try {
      // Always stop current sounds first to prevent overlapping
      await stopAllSounds();
      
      const soundscape = SOUNDSCAPES.find(s => s.id === soundscapeId);
      if (!soundscape || !soundscape.musicFile) {
        console.error('Soundscape not found or no music file:', soundscapeId);
        return;
      }
      
      // Load and play audio with expo-audio
      try {
        // Handle require() properly for both dev and production using utility function
        const audioSource = createAudioSourceFromRequire(soundscape.musicFile);
        debugAudioSource(audioSource, `Soundscape ${soundscapeId}`);
        
        audioPlayer.replace(audioSource);
        audioPlayer.play();
        audioPlayer.loop = true;
        setCurrentAudioSource(audioSource);
      } catch (audioError) {
        console.error('Error loading audio:', audioError);
        throw audioError;
      }
      
      setCurrentSoundscape(soundscapeId);
      setCurrentPractice(null); // Clear practice when playing soundscape
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing soundscape:', error);
      // Reset state on error
      setCurrentAudioSource(null);
      setCurrentSoundscape(null);
      setCurrentPractice(null);
      setIsPlaying(false);
    }
  };

  // New function for practice-specific music
  const playPracticeMusic = async (practiceId: string) => {
    try {
      // Always stop current sounds first to prevent overlapping
      await stopAllSounds();
      
      const practiceMusic = PRACTICE_MUSIC[practiceId];
      if (!practiceMusic || !practiceMusic.musicFile) {
        console.error('Practice music not found:', practiceId);
        return;
      }
      
      // Load and play practice audio with expo-audio
      try {
        // Handle require() properly for both dev and production using utility function
        const audioSource = createAudioSourceFromRequire(practiceMusic.musicFile);
        debugAudioSource(audioSource, `Practice ${practiceId}`);
        
        audioPlayer.replace(audioSource);
        audioPlayer.play();
        audioPlayer.loop = true;
        setCurrentAudioSource(audioSource);
      } catch (audioError) {
        console.error('Error loading practice audio:', audioError);
        throw audioError;
      }
      
      setCurrentPractice(practiceId); // Set current practice
      setCurrentSoundscape(null); // Clear soundscape when playing practice
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing practice music:', error);
      // Reset state on error
      setCurrentAudioSource(null);
      setCurrentSoundscape(null);
      setCurrentPractice(null);
      setIsPlaying(false);
    }
  };

  const stopAllSoundscapes = async () => {
    try {
      await stopAllSounds();
    } catch (error) {
      console.log('Error stopping sounds:', error);
    }
  };

  const toggleSoundscape = async () => {
    try {
      if (!currentAudioSource) {
        // No audio loaded - if we have a practice active, use practice music, otherwise use first soundscape
        if (currentPractice) {
          await playPracticeMusic(currentPractice);
        } else {
          const firstSoundscape = SOUNDSCAPES[0];
          await playSoundscape(firstSoundscape.id);
        }
        return;
      }

      if (isPlaying) {
        // Currently playing - pause it
        audioPlayer.pause();
        setIsPlaying(false);
      } else {
        // Currently paused - resume it
        audioPlayer.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('Error toggling sound:', error);
      // Reset state on error
      setIsPlaying(false);
    }
  };

  const toggleAutoplay = () => {
    setAutoplayEnabled(!autoplayEnabled);
  };

  const handleStartSession = async (sessionId: string) => {
    dispatch(startSession(sessionId));
    setShowTimer(true);
    
    // Don't auto-start any soundscape - let user choose
    // Users can manually select soundscapes if they want background music
  };

  const handleCloseTimer = async () => {
    dispatch(stopSession());
    setShowTimer(false);
    // Don't automatically stop soundscapes when closing timer
    // Let users manually control their background music
  };

  const soundscapes = SOUNDSCAPES;
  const biometricData = MOCK_BIOMETRICS;

  // Timer Screen
  if (showTimer && currentSession) {
    return (
      <SafeAreaView style={[styles.timerContainer, user?.preferences.theme === 'dark' && styles.darkContainer]}>
        <StatusBar barStyle={user?.preferences.theme === 'dark' ? 'light-content' : 'dark-content'} />
        
        <LinearGradient
          colors={[currentSession.color, `${currentSession.color}80`]}
          style={styles.timerGradient}
        >
          {/* Timer Header */}
          <View style={styles.timerHeader}>
            <TouchableOpacity style={styles.backButton} onPress={handleCloseTimer}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>{currentSession.name}</Text>
              <Text style={styles.sessionDuration}>{currentSession.duration} min session</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => setShowBiometrics(!showBiometrics)}
            >
              <MaterialIcons name="insights" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Timer Display */}
          <View style={styles.timerDisplay}>
            <CircularProgress
              size={280}
              width={8}
              fill={getProgress()}
              tintColor="white"
              backgroundColor="rgba(255,255,255,0.3)"
              rotation={-90}
              lineCap="round"
            >
              {() => (
                <View style={styles.timerCenter}>
                  <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                  <Text style={styles.progressText}>{Math.round(getProgress())}% Complete</Text>
                </View>
              )}
            </CircularProgress>
          </View>


          {/* Tap to toggle session play/pause */}
          <TouchableOpacity 
            style={styles.timerTapArea}
            onPress={() => dispatch(isActive ? stopSession() : startSession(currentSession.id))}
            activeOpacity={0.8}
          >
            <View style={styles.timerPlayIndicator}>
              <MaterialIcons 
                name={isActive ? 'pause' : 'play-arrow'} 
                size={24} 
                color="rgba(255,255,255,0.8)" 
              />
              <Text style={styles.timerPlayText}>
                {isActive ? 'Tap to pause' : 'Tap to start'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Feedback - only show minimal completion feedback */}
          {soundscapeFeedback && soundscapeFeedback.includes('✅') && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.timerFeedbackText}>{soundscapeFeedback}</Text>
            </View>
          )}
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Main Meditation Screen
  // Replace handleStartSession for guided meditation
  const handleGuidedSessionPress = (sessionId: string) => {
    setPendingSessionId(sessionId);
    setShowGuidedTimerModal(true);
  };

  // ...existing code...
  return (
    <SafeAreaView style={[styles.container, user?.preferences.theme === 'dark' && styles.darkContainer]}>
      <StatusBar barStyle={user?.preferences.theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: safeAreaInsets.top + 10 }]}>
        <Text style={[styles.title, user?.preferences.theme === 'dark' && styles.darkText]}>Meditation</Text>
        <Text style={[styles.subtitle, user?.preferences.theme === 'dark' && styles.darkSubText]}>
          Find your inner peace with guided sessions and ambient soundscapes
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Motivational Quote Slideshow */}
        <View style={styles.quoteSection}>
          <Text style={[styles.quoteSectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>
            💭 Daily Inspiration
          </Text>
          <Animated.View 
            style={[
              styles.quoteContainer,
              {
                opacity: quoteOpacity,
                transform: [{ scale: quoteScale }]
              }
            ]}
          >
            <View style={[styles.quoteCard, user?.preferences.theme === 'dark' && styles.darkQuoteCard]}>
              <View style={styles.quoteContent}>
                <Text style={[styles.quoteText, user?.preferences.theme === 'dark' && styles.darkText]}>
                  "{MOTIVATIONAL_QUOTES[currentQuoteIndex].quote}"
                </Text>
              </View>
            </View>
          </Animated.View>
          
          {/* Quote indicators */}
          <View style={styles.quoteIndicators}>
            {MOTIVATIONAL_QUOTES.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quoteIndicator,
                  index === currentQuoteIndex && styles.quoteIndicatorActive
                ]}
                onPress={() => {
                  setCurrentQuoteIndex(index);
                  // Reset animations
                  quoteOpacity.setValue(0);
                  quoteScale.setValue(0.95);
                  Animated.parallel([
                    Animated.timing(quoteOpacity, {
                      toValue: 1,
                      duration: 300,
                      useNativeDriver: true,
                    }),
                    Animated.timing(quoteScale, {
                      toValue: 1,
                      duration: 300,
                      useNativeDriver: true,
                    })
                  ]).start();
                }}
              />
            ))}
          </View>
        </View>
        {/* Soundscape Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="graphic-eq" size={24} color="#4ECDC4" />
            <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>
              Ambient Soundscapes
            </Text>
            <TouchableOpacity
              style={styles.biometricToggle}
              onPress={() => setShowBiometrics(!showBiometrics)}
            >
              <MaterialIcons name="insights" size={20} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.sectionSubtitle, user?.preferences.theme === 'dark' && styles.darkSubText]}>
            Choose from curated music designed for focus, relaxation, and sleep
          </Text>

          {/* Music controls - only show when music is playing */}
          {(currentSoundscape || currentPractice) && (
            <View style={[styles.musicControls, user?.preferences.theme === 'dark' && styles.darkMusicControls]}>
              <TouchableOpacity
                style={[styles.musicControlButton, isPlaying && styles.musicControlButtonActive]}
                onPress={toggleSoundscape}
              >
                <MaterialIcons 
                  name={isPlaying ? 'pause' : 'play-arrow'} 
                  size={20} 
                  color={isPlaying ? '#FFF' : '#4ECDC4'} 
                />
                <Text style={[styles.musicControlText, isPlaying && styles.darkMusicControlText]}>
                  {isPlaying ? 'Pause' : 'Play'}
                </Text>
              </TouchableOpacity>
              
              <Text style={[styles.currentMusic, user?.preferences.theme === 'dark' && styles.darkCurrentMusic]}>
                {currentPractice 
                  ? PRACTICE_MUSIC[currentPractice]?.name 
                  : soundscapes.find(s => s.id === currentSoundscape)?.name
                }
              </Text>
              
              <TouchableOpacity
                style={styles.musicControlButton}
                onPress={stopAllSounds}
              >
                <MaterialIcons name="stop" size={20} color="#FF6B6B" />
                <Text style={styles.musicControlText}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Core Soundscapes */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.soundscapeScroll}>
            <View style={styles.soundscapeContainer}>
              {soundscapes.map((soundscape) => (
                <TouchableOpacity
                  key={soundscape.id}
                  style={[
                    styles.soundscapeCard,
                    { backgroundColor: soundscape.color },
                    currentSoundscape === soundscape.id && styles.activeSoundscape
                  ]}
                  onPress={async () => {
                    if (currentSoundscape === soundscape.id) {
                      // Same soundscape - toggle play/pause
                      await toggleSoundscape();
                    } else {
                      // Different soundscape - play it
                      await playSoundscape(soundscape.id);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="graphic-eq" size={32} color="#FFF" />
                  <Text style={styles.soundscapeName}>{soundscape.name}</Text>
                  <Text style={styles.soundscapeDescription}>{soundscape.description}</Text>
                  
                  {currentSoundscape === soundscape.id && (
                    <View style={[styles.playingIndicator, isPlaying && styles.playingIndicatorActive]}>
                      <MaterialIcons 
                        name={isPlaying ? 'pause' : 'play-arrow'} 
                        size={16} 
                        color="#FFF" 
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

        </View>

        {/* Daily Practice Journey */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="trending-up" size={24} color="#4ECDC4" />
            <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>
              Daily Practice
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                // Reset daily practices for testing
                setDailyPractices(prev => prev.map(practice => ({
                  ...practice,
                  completed: false,
                  completedAt: null
                })));
                // Reset stats
                setStreakCount(0);
                setWeeklyMinutes(0);
                setTotalMinutes(0);
                // Stop any playing music
                stopAllSounds();
              }}
            >
              <MaterialIcons name="refresh" size={16} color="#718096" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.sectionSubtitle, user?.preferences.theme === 'dark' && styles.darkSubText]}>
            Build a consistent meditation habit with guided daily practices
          </Text>

          {/* Progress Streak */}
          <View style={[styles.streakContainer, user?.preferences.theme === 'dark' && styles.darkStreakContainer]}>
            <View style={styles.streakInfo}>
              <Text style={[styles.streakNumber, user?.preferences.theme === 'dark' && styles.darkText]}>{streakCount}</Text>
              <Text style={[styles.streakLabel, user?.preferences.theme === 'dark' && styles.darkSubText]}>Day Streak</Text>
            </View>
            <View style={styles.streakDots}>
              {[...Array(7)].map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.streakDot, 
                    index < streakCount 
                      ? (user?.preferences.theme === 'dark' ? { backgroundColor: '#4ECDC4' } : styles.streakDotComplete)
                      : (user?.preferences.theme === 'dark' ? { backgroundColor: '#333' } : styles.streakDotPending)
                  ]} 
                />
              ))}
            </View>
          </View>

          {/* Daily Practices */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.practiceScroll}>
            <View style={styles.practiceContainer}>
              {dailyPractices.map((practice) => (
                <TouchableOpacity
                  key={practice.id}
                  style={[
                    styles.practiceCard,
                    practice.completed && { opacity: 0.7 },
                    user?.preferences.theme === 'dark' && styles.darkPracticeCard
                  ]}
                  onPress={async () => {
                    if (!practice.completed) {
                      // Use practice-specific music instead of soundscapes
                      if (currentPractice === practice.id) {
                        // Same practice - toggle play/pause
                        await toggleSoundscape();
                      } else {
                        // Different or no practice playing - start this practice's music
                        await playPracticeMusic(practice.id);
                      }
                      
                      // Set up completion timeout only when starting a practice
                      if (!practiceTimeouts.current[practice.id]) {
                        const practiceMinutes = parseInt(practice.duration.split(' ')[0]);
                        practiceTimeouts.current[practice.id] = setTimeout(() => {
                          completePractice(practice.id);
                          delete practiceTimeouts.current[practice.id];
                        }, practiceMinutes * 60 * 1000);
                      }
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.practiceIcon, { backgroundColor: practice.color }]}>
                    <MaterialIcons name={practice.icon as any} size={24} color="#FFF" />
                    {practice.completed && (
                      <View style={styles.completedBadge}>
                        <MaterialIcons name="check" size={12} color="#FFF" />
                      </View>
                    )}
                    {/* Show playing indicator if this practice is active */}
                    {!practice.completed && currentPractice === practice.id && (
                      <View style={[styles.practicePlayingIndicator, isPlaying && styles.practicePlayingIndicatorActive]}>
                        <MaterialIcons 
                          name={isPlaying ? 'pause' : 'play-arrow'} 
                          size={12} 
                          color="#FFF" 
                        />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.practiceName, user?.preferences.theme === 'dark' && styles.darkText]}>
                    {practice.name}
                  </Text>
                  <Text style={[styles.practiceText, user?.preferences.theme === 'dark' && { color: '#FFFFFF' }]}>{practice.duration}</Text>
                  <Text style={[styles.practiceText, user?.preferences.theme === 'dark' && { color: '#FFFFFF' }]}>Tap to start</Text>
                  
                  {/* Status indicator */}
                  <View style={styles.practiceStatus}>
                    <Text style={styles.practiceStatusText}>
                      {practice.completed 
                        ? '✓ Done' 
                        : currentPractice === practice.id && isPlaying
                          ? 'Tap to pause'
                          : currentPractice === practice.id && !isPlaying
                            ? 'Tap to resume'
                            : 'Tap to start'
                      }
                    </Text>
                  </View>
                  
                  {practice.completed && practice.completedAt && (
                    <Text style={styles.completedTime}>
                      {practice.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Practice Stats */}
          <View style={[styles.practiceStats, user?.preferences.theme === 'dark' && styles.darkPracticeStats]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, user?.preferences.theme === 'dark' && styles.darkText]}>
                {dailyPractices.filter(p => p.completed).length}
              </Text>
              <Text style={[styles.statLabel, user?.preferences.theme === 'dark' && styles.darkStatLabel]}>Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, user?.preferences.theme === 'dark' && styles.darkText]}>{weeklyMinutes}</Text>
              <Text style={[styles.statLabel, user?.preferences.theme === 'dark' && styles.darkSubText]}>This Week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, user?.preferences.theme === 'dark' && styles.darkText]}>{totalMinutes}</Text>
              <Text style={[styles.statLabel, user?.preferences.theme === 'dark' && styles.darkSubText]}>Total Min</Text>
            </View>
          </View>
        </View>

        {/* Traditional Sessions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="self-improvement" size={24} color="#4ECDC4" />
            <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>
              Guided Meditations
            </Text>
          </View>
          
          <Text style={[styles.sectionSubtitle, user?.preferences.theme === 'dark' && styles.darkSubText]}>
            Full-length guided sessions with background music
          </Text>

          <View style={styles.sessionGrid}>
            {sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[
                  styles.sessionCard,
                  user?.preferences.theme === 'dark' && styles.darkSessionCard
                ]}
                onPress={() => {
                  setPendingSessionId(session.id);
                  setShowGuidedTimerModal(true);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.sessionIcon, { backgroundColor: session.color }]}> 
                  <MaterialIcons name={session.icon} size={28} color="#FFF" />
                </View>
                <View style={styles.sessionContent}>
                  <Text style={[styles.sessionName, user?.preferences.theme === 'dark' && styles.darkText]}>
                    {session.name}
                  </Text>
                  <Text style={[styles.sessionDescription, user?.preferences.theme === 'dark' && styles.darkSubText]}>
                    {session.description}
                  </Text>
                  <View style={styles.sessionMeta}>
                    <Text style={[styles.sessionDuration, user?.preferences.theme === 'dark' && styles.darkSubText]}>
                      {pendingSessionId === session.id && showGuidedTimerModal
                        ? `${guidedTimerMinutes} min`
                        : `${session.duration} min`}
                    </Text>
                    <Text style={[styles.sessionType, { color: session.color }]}> 
                      {session.type}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
      {/* Guided Meditation Timer Modal */}
      {showGuidedTimerModal && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <View style={{
            backgroundColor: user?.preferences.theme === 'dark' ? '#23272F' : '#FFF',
            borderRadius: 24,
            padding: 32,
            width: '80%',
            maxWidth: 400,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4ECDC4', marginBottom: 16 }}>Set Timer (minutes)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <TouchableOpacity
                style={{ padding: 12 }}
                onPress={() => setGuidedTimerMinutes(m => Math.max((m || 1) - 1, 1))}
              >
                <MaterialIcons name="remove" size={28} color="#4ECDC4" />
              </TouchableOpacity>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#4ECDC4', marginHorizontal: 24 }}>
                {guidedTimerMinutes}
              </Text>
              <TouchableOpacity
                style={{ padding: 12 }}
                onPress={() => setGuidedTimerMinutes(m => Math.min((m || 10) + 1, 120))}
              >
                <MaterialIcons name="add" size={28} color="#4ECDC4" />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#F1F5F9',
                  borderRadius: 16,
                  padding: 18,
                  flex: 1,
                  alignItems: 'center',
                  marginRight: 8,
                }}
                onPress={() => {
                  setShowGuidedTimerModal(false);
                  setGuidedTimerMinutes(10);
                  setPendingSessionId(null);
                }}
              >
                <Text style={{ color: '#475569', fontWeight: '700', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#4ECDC4',
                  borderRadius: 16,
                  padding: 18,
                  flex: 1,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowGuidedTimerModal(false);
                  if (pendingSessionId) {
                    // Start session with custom timer
                    dispatch(startSession({ sessionId: pendingSessionId, duration: guidedTimerMinutes }));
                    setShowTimer(true);
                  }
                  setGuidedTimerMinutes(10);
                  setPendingSessionId(null);
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFFE',
  },
  darkContainer: {
    backgroundColor: '#1E1E1E',
  },
  
  // Timer Screen Styles
  timerContainer: {
    flex: 1,
    backgroundColor: '#4ECDC4',
  },
  timerGradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  sessionInfo: {
    flex: 1,
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  sessionDuration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  moreButton: {
    padding: 10,
  },
  
  timerDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    color: 'white',
    textAlign: 'center',
  },
  progressText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  endelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  endelIndicatorActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  endelText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 6,
  },
  
  biometricPanel: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  biometricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  biometricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  biometricItem: {
    alignItems: 'center',
    flex: 1,
  },
  biometricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  biometricLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 20,
  },
  timerTapArea: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timerPlayIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  timerPlayText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 8,
    fontWeight: '500',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeControl: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  
  feedbackContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  timerFeedbackText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  
  // Main Screen Styles
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 22,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubText: {
    color: '#A0AEC0',
  },
  
  // Floating notification for playing music
  floatingNotification: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
    marginRight: 8,
  },
  floatingNotificationText: {
    fontSize: 12,
    color: '#2D3748',
    fontWeight: '500',
    marginRight: 8,
  },
  floatingPauseButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
  },
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  darkSectionContainer: { backgroundColor: '#23272F' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 12,
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 20,
    lineHeight: 20,
  },
  biometricToggle: {
    padding: 8,
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  
  // Endel Soundscape Styles
  musicControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkMusicControls: { backgroundColor: '#23272F', borderColor: '#333' },
  musicControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  musicControlButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  musicControlText: {
    fontSize: 14,
    color: '#4ECDC4',
    marginLeft: 6,
    fontWeight: '500',
  },
  darkMusicControlText: { color: '#FFF' },
  currentMusic: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
    textAlign: 'center',
  },
  darkCurrentMusic: { color: '#FFFFFF' },
  feedbackBanner: {
    backgroundColor: '#E6FFFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  feedbackText: {
    color: '#2D3748',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  nowPlayingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  nowPlayingActive: {
    backgroundColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nowPlayingText: {
    fontSize: 14,
    color: '#2D3748',
    marginLeft: 8,
    flex: 1,
  },
  playingPulse: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 4,
    marginLeft: 8,
  },
  
  autoplayContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  autoplayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  autoplayActive: {
    backgroundColor: '#4ECDC4',
  },
  autoplayText: {
    fontSize: 14,
    color: '#4ECDC4',
    marginLeft: 6,
    fontWeight: '500',
  },
  autoplayTextActive: {
    color: '#FFF',
  },
  
  soundscapeScroll: {
    marginBottom: 20,
  },
  soundscapeContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  soundscapeCard: {
    width: 160,
    height: 200,
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeSoundscape: {
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  soundscapeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 12,
  },
  soundscapeDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 16,
  },
  tapInstruction: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  playingIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
  },
  playingIndicatorActive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  
  biometricSection: {
    marginTop: 20,
  },
  biometricSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  biometricCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  biometricCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkBiometricCard: {
    backgroundColor: '#23272F',
    borderColor: '#333',
  },
  biometricCardValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  biometricCardLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Scenario Styles
  scenarioScroll: {
    marginBottom: 20,
  },
  scenarioContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  scenarioCard: {
    width: 140,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeScenario: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
    backgroundColor: '#E6FFFA',
  },
  scenarioIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scenarioEmoji: {
    fontSize: 24,
  },
  scenarioName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 4,
  },
  scenarioDuration: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  scenarioDescription: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 14,
  },
  scenarioPlayingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  
  // Traditional Session Styles
  sessionGrid: {
    gap: 16,
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkSessionCard: {
    backgroundColor: '#2D3748',
    borderColor: '#4A5568',
  },
  sessionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sessionContent: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
    lineHeight: 18,
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionType: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  
  // Daily Practice Styles
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkStreakContainer: { backgroundColor: '#23272F', borderColor: '#333' },
  streakInfo: {
    alignItems: 'center',
    marginRight: 20,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  streakLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  streakDots: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  streakDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  streakDotComplete: {
    backgroundColor: '#4ECDC4',
  },
  streakDotPending: {
    backgroundColor: '#E2E8F0',
  },
  practiceScroll: {
    marginBottom: 20,
  },
  practiceContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  practiceCard: {
    width: 120,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkPracticeCard: {
    backgroundColor: '#23272F',
    borderColor: '#333',
  },
  practiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practicePlayingIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practicePlayingIndicatorActive: {
    backgroundColor: '#4ECDC4',
  },
  practiceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 4,
  },
  practiceText: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
  },
  practiceStart: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  practiceStatusText: {
    fontSize: 10,
    color: '#718096',
    fontWeight: '500',
    textAlign: 'center',
  },
  practiceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkPracticeStats: { backgroundColor: '#23272F', borderColor: '#333' },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  //darkText: {
   // color: '#FFFFFF',
 // },
  //darkSubText: {
  //  color: '#A0AEC0',
  //},
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  darkStatLabel: { color: '#A0AEC0' },
  completedTime: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '500',
  },

  // Quote Slideshow Styles
  quoteSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quoteSectionTitle: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#4ECDC4',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quoteContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkQuoteCard: { backgroundColor: '#2D3748', borderColor: '#4A5568' },
  quoteGradient: {
    padding: 24,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteContent: {
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: 12,
    opacity: 0.8,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
    textAlign: 'center',
  },
  quoteIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  quoteIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
  },
  quoteIndicatorActive: {
    backgroundColor: '#4ECDC4',
    width: 24,
  },
});

export default MeditationScreen;
