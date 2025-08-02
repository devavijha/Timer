import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Vibration } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FocusModeScreen: React.FC = () => {
  const [focusActive, setFocusActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (focusActive) {
      const id = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      setIntervalId(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [focusActive]);

  const startFocus = () => {
    setTimer(0);
    setFocusActive(true);
    setShowTimerModal(true);
    Vibration.vibrate(100);
  };

  const endFocus = async () => {
    setFocusActive(false);
    setShowTimerModal(false);
    await AsyncStorage.setItem('lastFocusSession', timer.toString());
    Vibration.vibrate([100, 200, 100]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.motivationCard}>
        <MaterialIcons name="emoji-events" size={40} color="#FFE066" style={{ marginBottom: 10 }} />
        <Text style={styles.title}>Focus Mode</Text>
        <Text style={styles.desc}>Block distractions and stay focused!</Text>
        <Text style={styles.motivationText}>
          "Every minute in focus mode is a step closer to your goals. You’ve got this!"
        </Text>
      </View>
      <TouchableOpacity style={styles.focusButton} onPress={startFocus} disabled={focusActive}>
        <MaterialIcons name="do-not-disturb" size={32} color="white" />
        <Text style={styles.focusButtonText}>{focusActive ? 'Focus Active' : 'Start Focus Mode'}</Text>
      </TouchableOpacity>
      <Modal visible={showTimerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.timerText}>Focus Session: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}</Text>
            <TouchableOpacity style={styles.endButton} onPress={endFocus}>
              <MaterialIcons name="stop" size={24} color="white" />
              <Text style={styles.endButtonText}>End Focus</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4ECDC4', marginBottom: 10 },
  desc: { color: '#CCCCCC', fontSize: 16, marginBottom: 30, textAlign: 'center', paddingHorizontal: 20 },
  focusButton: { backgroundColor: '#4ECDC4', padding: 20, borderRadius: 30, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  focusButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#222', padding: 30, borderRadius: 20, alignItems: 'center' },
  timerText: { color: '#FFE066', fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  endButton: { backgroundColor: '#FF9999', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  endButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  motivationCard: {
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  motivationText: {
    color: '#FFE066',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
});

export default FocusModeScreen;
