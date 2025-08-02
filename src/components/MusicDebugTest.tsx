// Music Service Debug Test
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { audioService } from '../services/meditationAudioService';

export const MusicDebugTest: React.FC = () => {
  const [status, setStatus] = useState(audioService.getCurrentStatus());
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(audioService.getCurrentStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const testPlayMusic = async (category: string) => {
    addLog(`Testing ${category} music...`);
    try {
      const success = await audioService.playMusic(category);
      addLog(`Play result: ${success ? 'SUCCESS' : 'FAILED'}`);
      setStatus(audioService.getCurrentStatus());
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const testPause = async () => {
    addLog('Testing pause...');
    try {
      await audioService.pauseMusic();
      addLog('Pause completed');
      setStatus(audioService.getCurrentStatus());
    } catch (error) {
      addLog(`Pause error: ${error}`);
    }
  };

  const testResume = async () => {
    addLog('Testing resume...');
    try {
      await audioService.resumeMusic();
      addLog('Resume completed');
      setStatus(audioService.getCurrentStatus());
    } catch (error) {
      addLog(`Resume error: ${error}`);
    }
  };

  const testStop = async () => {
    addLog('Testing stop...');
    try {
      await audioService.stopMusic();
      addLog('Stop completed');
      setStatus(audioService.getCurrentStatus());
    } catch (error) {
      addLog(`Stop error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music Service Debug</Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Current Status:</Text>
        <Text>Playing: {status.isPlaying ? 'YES' : 'NO'}</Text>
        <Text>Category: {status.category || 'None'}</Text>
        <Text>Track: {status.trackName || 'None'}</Text>
        <Text>Volume: {status.volume}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => testPlayMusic('ambient')}>
          <Text style={styles.buttonText}>Play Ambient</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => testPlayMusic('nature')}>
          <Text style={styles.buttonText}>Play Nature</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testPause}>
          <Text style={styles.buttonText}>Pause</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testResume}>
          <Text style={styles.buttonText}>Resume</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testStop}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsCard}>
        <Text style={styles.logsTitle}>Recent Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4ECDC4',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logsCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    maxHeight: 150,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});
