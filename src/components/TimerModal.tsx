import React, { useState } from 'react';
import { View, Text, Button, Modal, TouchableOpacity, TextInput } from 'react-native';

interface TimerModalProps {
  visible: boolean;
  onClose: () => void;
  onSetTimer: (seconds: number) => void;
  theme?: 'dark' | 'light';
}

export const TimerModal: React.FC<TimerModalProps> = ({ visible, onClose, onSetTimer, theme }) => {
  const [customTime, setCustomTime] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
        <View style={{
          backgroundColor: theme === 'dark' ? '#1E293B' : '#fff',
          padding: 24,
          borderRadius: 16,
          width: 300,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 12,
            color: theme === 'dark' ? '#F8FAFC' : '#1E293B',
          }}>Set Timer (minutes)</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: theme === 'dark' ? '#475569' : '#4ECDC4',
              borderRadius: 8,
              padding: 8,
              marginBottom: 16,
              backgroundColor: theme === 'dark' ? '#334155' : '#fff',
              color: theme === 'dark' ? '#F8FAFC' : '#1E293B',
            }}
            keyboardType="numeric"
            value={customTime}
            onChangeText={setCustomTime}
            placeholder="Enter minutes"
            placeholderTextColor={theme === 'dark' ? '#94A3B8' : '#999'}
          />
          {/* Only custom input, no preset timer options */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
              <Text style={{ color: '#FF9999', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const seconds = parseInt(customTime) * 60;
                if (!isNaN(seconds) && seconds > 0) {
                  onSetTimer(seconds);
                  onClose();
                }
              }}
              style={{ padding: 10 }}
            >
              <Text style={{ color: theme === 'dark' ? '#4ECDC4' : '#4ECDC4', fontWeight: 'bold' }}>Set Timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
