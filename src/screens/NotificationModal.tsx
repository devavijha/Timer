import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const NotificationModal: React.FC<{ onAllow: () => void; onDeny: () => void }> = ({ onAllow, onDeny }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="notifications" size={36} color="#4ECDC4" />
        </View>
        <Text style={styles.title}>Allow Focus to send you notifications?</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.allowButton} onPress={onAllow}>
            <Text style={styles.buttonText}>Allow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.denyButton} onPress={onDeny}>
            <Text style={styles.buttonText}>Don't allow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#23272F',
    borderRadius: 24,
    padding: 32,
    width: '88%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  iconCircle: {
    backgroundColor: 'rgba(78,205,196,0.15)',
    borderRadius: 32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  allowButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 12,
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  denyButton: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default NotificationModal;
