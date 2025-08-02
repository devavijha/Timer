import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector, useDispatch, useSafeArea } from '../utils/hooks';
import { 
  createHabitAsync, 
  toggleHabitCompletion, 
  loadUserHabitsAsync,
  deleteHabitAsync 
} from '../store/habitsSlice';

const HabitsScreen: React.FC = () => {
  // Load habits from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedHabits = await AsyncStorage.getItem('userHabits');
        if (storedHabits) {
          // Optionally dispatch to Redux or set local state
        }
      } catch (error) {
        console.error('Error loading offline habits:', error);
      }
    })();
  }, []);
  const dispatch = useDispatch();
  const { habits } = useSelector((state) => state.habits);
  const { user } = useSelector((state) => state.user);
  const safeAreaInsets = useSafeArea();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [showDeleteHabitModal, setShowDeleteHabitModal] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user?.id) {
      dispatch(loadUserHabitsAsync(user.id));
    }
    // Save habits to AsyncStorage whenever they change
    (async () => {
      try {
        await AsyncStorage.setItem('userHabits', JSON.stringify(habits));
      } catch (error) {
        console.error('Error saving habits:', error);
      }
    })();
  }, [dispatch, user?.id, habits]);

  const handleToggleHabit = async (habitId: string) => {
    try {
      await dispatch(toggleHabitCompletion({ habitId, date: today })).unwrap();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim() || !user?.id) return;

    try {
      const colors = ['#4ECDC4', '#FFE066', '#FF9999', '#95E1A3', '#A8E6CF'];
      const icons = ['water-drop', 'fitness-center', 'local-florist', 'spa', 'bedtime'];
      let randomIcon = icons[Math.floor(Math.random() * icons.length)];
      if (newHabitName.trim().toLowerCase() === 'sleep') {
        randomIcon = 'bedtime';
      }
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      await dispatch(createHabitAsync({ 
        userId: user.id,
        habitData: {
          name: newHabitName, 
          color: randomColor, 
          icon: randomIcon 
        }
      })).unwrap();
      
      setNewHabitName('');
      setShowAddHabit(false);
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  const handleDeleteHabit = async () => {
    if (!showDeleteHabitModal) return;
    try {
      await dispatch(deleteHabitAsync(showDeleteHabitModal)).unwrap();
      setShowDeleteHabitModal(null);
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const isHabitCompletedToday = (habit: any) => {
    return habit.completedDates.includes(today);
  };

  return (
    <SafeAreaView style={[styles.container, user?.preferences.theme === 'dark' && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: safeAreaInsets.top + 10 }]}>
        <Text style={[styles.title, user?.preferences.theme === 'dark' && styles.darkText]}>Habits</Text>
        <TouchableOpacity 
          style={[styles.addButton, user?.preferences.theme === 'dark' && styles.darkAddButton]}
          onPress={() => setShowAddHabit(true)}
        >
          <MaterialIcons name="add" size={24} color="#4ECDC4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Today's Habits */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Today</Text>
          <Text style={[styles.sectionDate, user?.preferences.theme === 'dark' && styles.darkSubText]}>{new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}</Text>

          <View style={styles.habitsList}>
            {habits.length > 0 ? (
              habits.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={[
                    styles.habitCard, 
                    { backgroundColor: user?.preferences.theme === 'dark' ? '#2A2A2A' : habit.color + '20' },
                    user?.preferences.theme === 'dark' && styles.darkCard,
                    user?.preferences.theme === 'dark' && styles.darkCardBorder
                  ]}
                  onPress={() => handleToggleHabit(habit.id)}
                >
                  <View style={styles.habitInfo}>
                    <View style={[styles.habitIcon, { backgroundColor: habit.color }]}> 
                      <MaterialIcons
                        name={habit.icon as any} 
                        size={24} 
                        color="white" 
                      />
                    </View>
                    <View style={styles.habitDetails}>
                      <Text style={[styles.habitName, user?.preferences.theme === 'dark' && styles.darkText]}>{habit.name}</Text>
                      <Text style={[styles.habitStreak, user?.preferences.theme === 'dark' && styles.darkSubText]}>
                        {habit.streak} day streak • Best: {habit.longestStreak} days
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      style={styles.checkButton}
                      onPress={() => handleToggleHabit(habit.id)}
                    >
                      <MaterialIcons
                        name={isHabitCompletedToday(habit) ? "check-circle" : "radio-button-unchecked"}
                        size={28}
                        color={isHabitCompletedToday(habit) ? "#4CAF50" : "#BDC3C7"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => setShowDeleteHabitModal(habit.id)}
                    >
                      <MaterialIcons name="delete-outline" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="star-outline" size={64} color="#4ECDC4" />
                <Text style={[styles.emptyTitle, user?.preferences.theme === 'dark' && styles.darkText]}>No habits yet</Text>
                <Text style={[styles.emptySubtitle, user?.preferences.theme === 'dark' && styles.darkSubText]}>Tap the + button above to create your first habit!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Progress Section */}
        <View style={[styles.progressSection, user?.preferences.theme === 'dark' && styles.darkerProgressSection]}>
          <Text style={[styles.progressTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Progress</Text>
          <View style={styles.progressCards}>
            {habits.slice(0, 3).map((habit) => (
              <View key={habit.id} style={[styles.progressCard, user?.preferences.theme === 'dark' && styles.darkerProgressCard]}>
                <Text style={[styles.progressLabel, user?.preferences.theme === 'dark' && styles.darkText]}>{habit.name}</Text>
                <View style={[styles.progressCircle, user?.preferences.theme === 'dark' && styles.darkerProgressCircle, { backgroundColor: user?.preferences.theme === 'dark' ? '#181A20' : habit.color + '20' }]}>
                  <Text style={[styles.progressPercentage, { color: habit.color }, user?.preferences.theme === 'dark' && styles.darkText]}>
                    {isHabitCompletedToday(habit) ? '✓' : `${habit.streak}`}
                  </Text>
                </View>
                <Text style={[styles.progressSubtext, user?.preferences.theme === 'dark' && styles.darkSubText]}>
                  {isHabitCompletedToday(habit) ? 'Done Today' : `${habit.streak} day streak`}
                </Text>
              </View>
            ))}
          </View>

          {habits.length === 0 && (
            <View style={styles.emptyProgressState}>
              <MaterialIcons name="trending-up" size={48} color="#4ECDC4" />
              <Text style={[styles.emptyProgressText, user?.preferences.theme === 'dark' && styles.darkSubText]}>Start building habits to see your progress!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        visible={showAddHabit}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddHabit(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, user?.preferences.theme === 'dark' && styles.darkCard]}>
            <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Add New Habit</Text>
            <TextInput
              style={[styles.modalInput, user?.preferences.theme === 'dark' && styles.darkModalInput]}
              placeholder="Habit name"
              placeholderTextColor={user?.preferences.theme === 'dark' ? '#888' : undefined}
              value={newHabitName}
              onChangeText={setNewHabitName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddHabit(false)}
              >
                <Text style={[styles.cancelButtonText, user?.preferences.theme === 'dark' && styles.darkSubText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddHabit}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Habit Modal */}
      <Modal
        visible={!!showDeleteHabitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteHabitModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, user?.preferences.theme === 'dark' && styles.darkCard]}>
            <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Delete this habit?</Text>
            <Text style={[styles.modalText, user?.preferences.theme === 'dark' && styles.darkSubText]}>This action cannot be undone.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteHabitModal(null)}
              >
                <Text style={[styles.cancelButtonText, user?.preferences.theme === 'dark' && styles.darkSubText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDeleteHabit}
              >
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  darkCardBorder: {
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  darkHabitIcon: {
    borderWidth: 1,
    borderColor: '#333',
  },
  darkProgressCircle: {
    borderWidth: 1,
    borderColor: '#333',
  },
  darkAddButton: {
    backgroundColor: '#23272F',
    shadowColor: '#000',
    borderColor: '#333',
    borderWidth: 1,
  },
  darkModalInput: {
    color: '#FFF',
    borderColor: '#333',
    backgroundColor: '#23272F',
  },
  darkCancelButton: {
    backgroundColor: '#23272F',
  },
  darkConfirmButton: {
    backgroundColor: '#4ECDC4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  sectionDate: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  habitsList: {
    gap: 15,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  habitStreak: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  checkButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  darkerProgressSection: {
    backgroundColor: '#181A20',
    borderWidth: 1,
    borderColor: '#111216',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 18,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  progressCards: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  progressCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkerProgressCard: {
    backgroundColor: '#23242A',
    borderWidth: 1,
    borderColor: '#181A20',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkerProgressCircle: {
    borderWidth: 1,
    borderColor: '#111216',
    backgroundColor: '#181A20',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressSubtext: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 5,
    textAlign: 'center',
  },
  emptyProgressState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyProgressText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: 320, // fixed width instead of '80%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#4ECDC4',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
    color: '#64748B',
    lineHeight: 26,
    fontWeight: '500',
  },
});

export default HabitsScreen;
