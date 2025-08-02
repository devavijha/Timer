import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TimerInsightsProps {
  timerSessions: Array<{ start: number; end: number; completed: boolean }>; // timestamps
}

export const TimerInsights: React.FC<TimerInsightsProps> = ({ timerSessions }) => {
  // Only count completed sessions
  const completedSessions = timerSessions.filter(s => s.completed && s.end > s.start);
  // Calculate total time spent in seconds
  const totalTimeSec = completedSessions.reduce((sum, s) => sum + Math.round((s.end - s.start) / 1000), 0);
  const avgSessionSec = completedSessions.length > 0 ? totalTimeSec / completedSessions.length : 0;
  const completionRate = timerSessions.length > 0 ? (completedSessions.length / timerSessions.length) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer Insights</Text>
      <Text style={styles.stat}>Total Time: {Math.floor(totalTimeSec / 60)} min {totalTimeSec % 60}s</Text>
      <Text style={styles.stat}>Avg Session: {Math.floor(avgSessionSec / 60)} min {Math.round(avgSessionSec % 60)}s</Text>
      <Text style={styles.stat}>Completion Rate: {completionRate.toFixed(1)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFE066',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#4ECDC4',
  },
  stat: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});
