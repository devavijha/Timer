import React, { useEffect, useState, useRef } from 'react';
import { AnimatedCircularProgress } from './AnimatedCircularProgress';
import { Audio } from 'expo-av';
import { Vibration } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
  onCancel: () => void;
  theme?: 'dark' | 'light';
}

const SOUND_OPTIONS = [
  { label: 'Notify Sound', file: require('../../assets/notify.mp3') },
  { label: 'Meditation Bell', file: require('../Music/meditation-154980.mp3') },
  { label: 'Soft Chime', file: require('../Music/396-hz-eliminate-fear-183307.mp3') },
  { label: 'Yoga Gong', file: require('../Music/yoga-meditation-252461.mp3') },
];

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ seconds, onComplete, onCancel, theme }) => {
  const [customDuration, setCustomDuration] = useState(seconds);
  const [showElapsed, setShowElapsed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  // Always use notify.mp3 for timer completion
  const notifySound = require('../../assets/notify.mp3');
  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(notifySound);
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 2000);
    } catch (e) {
      // fallback: vibrate or ignore
    }
  };
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => prev - 1);
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else if (remaining === 0) {
      setIsRunning(false);
      playSound();
      Vibration.vibrate(500);
      setShowElapsed(true);
      onComplete();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining, onComplete]);

  const handleStart = () => setIsRunning(true);
  const handleDurationChange = (val: number) => {
    setCustomDuration(val);
    setRemaining(val);
    setElapsed(0);
    setShowElapsed(false);
  };
  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const handleResume = () => setIsRunning(true);
  const handleCancel = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRemaining(seconds);
    setElapsed(0);
    setShowElapsed(false);
    onCancel();
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(seconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, theme === 'dark' && styles.darkCardContainer]}>
      {/* Removed preset timer duration buttons and sound selector */}
      <View>
        <Text style={[styles.time, theme === 'dark' && styles.darkTime]}>{formatTime(remaining)}</Text>
        {showElapsed && (
          <Text style={[styles.time, { fontSize: 16, color: '#95E1A3' }, theme === 'dark' && styles.darkTime]}>Elapsed: {formatTime(elapsed)}</Text>
        )}
      </View>
      <View style={styles.progressBarWrap}>
        <View style={[styles.progressBarTrack, theme === 'dark' && styles.darkProgressBarTrack]}>
          <View style={[styles.progressBarFill, theme === 'dark' && styles.darkProgressBarFill, { width: `${(remaining / seconds) * 100}%` }]} />
        </View>
      </View>
      <View style={styles.controls}>
        {!isRunning && remaining === seconds && (
          <TouchableOpacity style={[styles.btn, theme === 'dark' && styles.darkBtn]} onPress={handleStart}>
            <Text style={[styles.btnText, theme === 'dark' && styles.darkBtnText]}>Start</Text>
          </TouchableOpacity>
        )}
        {isRunning && (
          <TouchableOpacity style={[styles.btn, theme === 'dark' && styles.darkBtn]} onPress={handlePause}>
            <Text style={[styles.btnText, theme === 'dark' && styles.darkBtnText]}>Pause</Text>
          </TouchableOpacity>
        )}
        {!isRunning && remaining < seconds && remaining > 0 && (
          <TouchableOpacity style={[styles.btn, theme === 'dark' && styles.darkBtn]} onPress={handleResume}>
            <Text style={[styles.btnText, theme === 'dark' && styles.darkBtnText]}>Resume</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btn, theme === 'dark' && styles.darkBtn]} onPress={handleReset}>
          <Text style={[styles.btnText, { color: '#FFE066' }, theme === 'dark' && styles.darkBtnText]}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, theme === 'dark' && styles.darkBtn]} onPress={handleCancel}>
          <Text style={[styles.btnText, { color: '#FF9999' }, theme === 'dark' && styles.darkBtnText]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  darkCardContainer: {
    backgroundColor: '#1E293B',
    shadowColor: '#000',
  },
  darkDurationBtn: {
    backgroundColor: '#334155',
  },
  darkDurationBtnText: {
    color: '#F8FAFC',
  },
  darkSoundBtn: {
    backgroundColor: '#334155',
  },
  darkSoundDot: {
    backgroundColor: '#4ECDC4',
    borderColor: '#FFE066',
  },
  darkTime: {
    color: '#F8FAFC',
  },
  darkElapsedText: {
    color: '#FFE066',
  },
  darkProgressBarTrack: {
    backgroundColor: '#334155',
  },
  darkProgressBarFill: {
    backgroundColor: '#4ECDC4',
  },
  darkBtn: {
    backgroundColor: '#6366F1',
  },
  darkBtnText: {
    color: '#F8FAFC',
  },
  soundDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 6,
  },
  soundDotActive: {
    backgroundColor: '#4ECDC4',
    borderWidth: 2,
    borderColor: '#FFE066',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginVertical: 16,
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  selectorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  selectorGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  progressRingWrap: {
  // Removed styles for duration and sound selector buttons
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  soundBtnTextActive: {
    color: '#fff',
  },
  progressBarWrap: {
    width: '100%',
    marginBottom: 8,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  container: {
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  time: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 4,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
