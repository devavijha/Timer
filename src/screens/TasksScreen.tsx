// TimerInsights import removed
        {/* TimerInsights removed as requested */}
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { saveMeditationData, loadMeditationData } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Modal, Animated } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch, useSafeArea } from '../utils/hooks';
import { 
  createTaskAsync, 
  updateTaskAsync, 
  deleteTaskAsync, 
  createCategoryAsync, 
  deleteCategoryAsync,
  loadUserTasksAsync 
} from '../store/tasksSlice';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { TimerModal } from '../components/TimerModal';
import { CountdownTimer } from '../components/CountdownTimer';

const PROGRESS_BAR_WIDTH = 180; // px, adjust as needed

const TasksScreen: React.FC = () => {
  const { categories } = useSelector((state) => state.tasks);
  type ActiveTimer = { taskId: string; title: string; duration: number; start: number };
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);

  // Load tasks and timers from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('userTasks');
        if (storedTasks) {
          // Optionally dispatch to Redux or set local state
        }
        const storedTimers = await AsyncStorage.getItem('activeTimers');
        if (storedTimers) {
          setActiveTimers(JSON.parse(storedTimers));
        }
      } catch (error) {
        console.error('Error loading offline tasks/timers:', error);
      }
    })();
  }, []);

  // Sync timers with tasks: start timer for any new task with timer
  useEffect(() => {
    if (!categories) return;
    const newTimers: ActiveTimer[] = [];
    categories.forEach(cat => {
      cat.tasks.forEach(task => {
        // Only add timer if not completed and not already present with same taskId and duration
        if (task.timer && !task.completed && !activeTimers.some(t => t.taskId === task.id && t.duration === task.timer)) {
          newTimers.push({ taskId: task.id, title: task.title, duration: Number(task.timer), start: Date.now() });
        }
      });
    });
    if (newTimers.length > 0) {
      setActiveTimers(timers => {
        // Remove duplicate timers for same taskId and duration, but keep unique start
        const merged = [...timers, ...newTimers];
        const unique = merged.filter((timer, idx, arr) =>
          arr.findIndex(t => t.taskId === timer.taskId && t.duration === timer.duration && t.start === timer.start) === idx
        );
        return unique;
      });
    }
    // Save tasks to AsyncStorage
    (async () => {
      try {
        await AsyncStorage.setItem('userTasks', JSON.stringify(categories));
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    })();
  }, [categories, activeTimers]);

  // Save activeTimers to AsyncStorage whenever they change
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem('activeTimers', JSON.stringify(activeTimers));
      } catch (error) {
        console.error('Error saving timers:', error);
      }
    })();
  }, [activeTimers]);

  const timerSessions = useAppSelector((state) => state.timer.sessions);
  const appDispatch = useAppDispatch();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const safeAreaInsets = useSafeArea();
  const { showSuccess, showError, toast } = useToast();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState<{categoryId: string, taskId: string} | null>(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState<{categoryId: string, name: string} | null>(null);
  const [askTimer, setAskTimer] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [pendingTaskCategory, setPendingTaskCategory] = useState<string | null>(null);
  const [pendingTaskTitle, setPendingTaskTitle] = useState('');
  const [pendingTimer, setPendingTimer] = useState<number | null>(null);

  // Function to get gradient colors based on stored color
  const getGradientColors = (color: string): [string, string] => {
    const colorMap: Record<string, [string, string]> = {
      '#6366F1': ['#6366F1', '#8B5CF6'],
      '#10B981': ['#10B981', '#059669'],
      '#F59E0B': ['#F59E0B', '#D97706'],
      '#EF4444': ['#EF4444', '#DC2626'],
      '#8B5CF6': ['#8B5CF6', '#7C3AED'],
      '#06B6D4': ['#06B6D4', '#0891B2'],
      '#84CC16': ['#84CC16', '#65A30D'],
      '#F97316': ['#F97316', '#EA580C'],
    };
    return colorMap[color] || [color, color + 'CC'];
  };

    // Modern, accessible color palette for category cards
  const categoryColors = [
    ['#6366F1', '#8B5CF6'], // Indigo to Purple
    ['#10B981', '#059669'], // Emerald gradient
    ['#F59E0B', '#D97706'], // Amber gradient
    ['#EF4444', '#DC2626'], // Red gradient
    ['#8B5CF6', '#7C3AED'], // Purple gradient
    ['#06B6D4', '#0891B2'], // Cyan gradient
    ['#84CC16', '#65A30D'], // Lime gradient
    ['#F97316', '#EA580C'], // Orange gradient
  ];

  useEffect(() => {
    if (user?.id) {
      dispatch(loadUserTasksAsync(user.id));
    }
  }, [dispatch, user?.id]);

    const handleAddCategory = () => {
    if (newCategoryName.trim() && user?.id) {
      const randomColorPair = categoryColors[Math.floor(Math.random() * categoryColors.length)];
      dispatch(createCategoryAsync({
        userId: user.id,
        name: newCategoryName.trim(),
        color: randomColorPair[0], // Use the first color from the gradient pair
      }));
      setNewCategoryName('');
      setShowAddCategory(false);
      showSuccess('Category added successfully!');
    }
  };

  const handleAddTask = async (categoryId: string) => {
    if (!newTaskTitle.trim() || !user?.id) return;
    // Ask if user wants timer
    setAskTimer(true);
    setPendingTaskCategory(categoryId);
    setPendingTaskTitle(newTaskTitle.trim());
  };

  // Actually create the task after timer decision
  const handleCreateTaskWithTimer = async (categoryId: string, title: string, timerSeconds: number | null) => {
    if (!user?.id) return;
    try {
      await dispatch(createTaskAsync({ 
        userId: user.id, 
        categoryId, 
        title,
        timer: timerSeconds || undefined
      })).unwrap();
      // Start timer automatically for new task
      if (timerSeconds) {
        setTimeout(() => {
          const cat = categories.find(c => c.id === categoryId);
          if (cat && cat.tasks.length > 0) {
            const newTask = cat.tasks[cat.tasks.length - 1];
            setActiveTimers(timers => [...timers, { taskId: newTask.id, title: newTask.title, duration: timerSeconds, start: Date.now() }]);
          }
        }, 500);
      }
      setNewTaskTitle('');
      setShowAddTask(null);
      setPendingTaskCategory(null);
      setPendingTaskTitle('');
      setPendingTimer(null);
      showSuccess('Task added successfully!', 'Success');
    } catch (error) {
      console.error('Failed to create task:', error);
      showError('Failed to create task', 'Error');
    }
  };

  const handleToggleTask = async (categoryId: string, taskId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      const task = category?.tasks.find(t => t.id === taskId);
      if (task) {
        await dispatch(updateTaskAsync({ 
          taskId, 
          updates: { completed: !task.completed } 
        })).unwrap();
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDeleteTask = (categoryId: string, taskId: string) => {
    setShowDeleteTaskModal({ categoryId, taskId });
  };

  const confirmDeleteTask = async () => {
    if (!showDeleteTaskModal) return;
    
    try {
      await dispatch(deleteTaskAsync(showDeleteTaskModal.taskId)).unwrap();
      // Remove timer for deleted task
      setActiveTimers(timers => timers.filter(t => t.taskId !== showDeleteTaskModal.taskId));
      setShowDeleteTaskModal(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
      showError('Failed to delete task', 'Error');
    }
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    setShowDeleteCategoryModal({ categoryId, name: categoryName });
  };

  const confirmDeleteCategory = async () => {
    if (!showDeleteCategoryModal) return;
    
    try {
      await dispatch(deleteCategoryAsync(showDeleteCategoryModal.categoryId)).unwrap();
      showSuccess(`"${showDeleteCategoryModal.name}" has been deleted successfully.`, 'Success');
      setShowDeleteCategoryModal(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
      showError('Failed to delete category', 'Error');
    }
  };

  const getTotalTasks = () => {
    return categories.reduce((total, category) => total + category.tasks.length, 0);
  };

  const getCompletedTasks = () => {
    return categories.reduce((total, category) => 
      total + category.tasks.filter(task => task.completed).length, 0
    );
  };

  const progressAnims = useMemo(
    () => categories.map(() => new Animated.Value(0)),
    [categories.length]
  );

  useEffect(() => {
    categories.forEach((category, idx) => {
      const completedTasks = category.tasks.filter(t => t.completed).length;
      const totalTasks = category.tasks.length;
      const progressPercentage = totalTasks > 0 ? completedTasks / totalTasks : 0;
      Animated.timing(progressAnims[idx], {
        toValue: progressPercentage,
        duration: 500,
        useNativeDriver: false,
      }).start();
    });
  }, [categories, progressAnims]);

  return (
    <SafeAreaView style={[styles.container, user?.preferences.theme === 'dark' && styles.darkContainer]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: safeAreaInsets.top + 10 }]}> 
          <View style={styles.headerContent}>
            <Text style={[styles.title, user?.preferences.theme === 'dark' && styles.darkText]}>Tasks</Text>
            <Text style={[styles.subtitle, user?.preferences.theme === 'dark' && styles.darkSubText]}>
              {getTotalTasks() > 0 
                ? `${getCompletedTasks()}/${getTotalTasks()} tasks completed` 
                : 'Create your categorised task boards'
              }
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.addButton, user?.preferences.theme === 'dark' && styles.darkAddButton]}
            onPress={() => setShowAddCategory(true)}
          >
            <MaterialIcons name="add" size={24} color="#4ECDC4" />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        {categories.length > 0 && (
          <View style={[styles.statsContainer, user?.preferences.theme === 'dark' && styles.darkCard]}>
            <View style={styles.statItem}>
              <MaterialIcons name="folder" size={24} color="#6366F1" />
              <Text style={[styles.statNumber, user?.preferences.theme === 'dark' && styles.darkText]}>{categories.length}</Text>
              <Text style={[styles.statLabel, user?.preferences.theme === 'dark' && styles.darkSubText]}>Categories</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="assignment" size={24} color="#10B981" />
              <Text style={[styles.statNumber, user?.preferences.theme === 'dark' && styles.darkText]}>{getTotalTasks()}</Text>
              <Text style={[styles.statLabel, user?.preferences.theme === 'dark' && styles.darkSubText]}>Total Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="check-circle" size={24} color="#F59E0B" />
              <Text style={[styles.statNumber, user?.preferences.theme === 'dark' && styles.darkText]}>{getCompletedTasks()}</Text>
              <Text style={[styles.statLabel, user?.preferences.theme === 'dark' && styles.darkSubText]}>Completed</Text>
            </View>
          </View>
        )}

        {/* Single timer below Add New Category button */}
        {activeTimers.length > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 10, paddingVertical: 4 }}>
            <CountdownTimer
              key={`${activeTimers[0].taskId}-${activeTimers[0].start}`}
              seconds={activeTimers[0].duration}
              onComplete={() => {
                const end = Date.now();
                const currentTimer = activeTimers[0];
                appDispatch({ type: 'timer/addSession', payload: { taskId: currentTimer.taskId, start: currentTimer.start, end, completed: true } });
                setActiveTimers(timers => timers.slice(1)); // Remove the first timer
              }}
              onCancel={() => {
                setActiveTimers(timers => timers.slice(1)); // Remove the first timer
              }}
              theme={user?.preferences.theme}
            />
          </View>
        )}

        {/* Category Cards */}
        <View style={styles.scrollView}>
          {categories.map((category, categoryIdx) => {
            const completedTasks = category.tasks.filter(t => t.completed).length;
            const totalTasks = category.tasks.length;
            const progressPercentage = totalTasks > 0 ? completedTasks / totalTasks : 0;

            // Animated progress bar
            const progressAnim = progressAnims[categoryIdx];

            return (
            <LinearGradient
              key={category.id}
              colors={getGradientColors(category.color)}
              style={styles.categoryCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.categoryContent}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryTitleRow}>
                    <Text style={styles.categoryTitle}>{category.name}</Text>
                    <View style={styles.categoryActions}>
                      <View style={styles.progressIndicator}>
                        <Text style={styles.progressText}>
                          {completedTasks}/{totalTasks}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={styles.progressTrack}>
                      <Animated.View
                        style={[
                          styles.progressFill,
                          {
                            width: progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, PROGRESS_BAR_WIDTH],
                              extrapolate: 'clamp',
                            }),
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.tasksList}>
                  {category.tasks.length === 0 ? (
                    <View style={styles.emptyState}>
                      <MaterialIcons name="add-task" size={32} color="rgba(255, 255, 255, 0.7)" />
                      <Text style={styles.emptyText}>Tap to add your first task</Text>
                    </View>
                  ) : (
                    <>
                      {category.tasks.slice(0, 3).map((task) => (
        <View key={task.id} style={styles.taskItem}>
                          <TouchableOpacity
                            style={styles.checkBox}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleToggleTask(category.id, task.id);
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <MaterialIcons
                              name={task.completed ? "check-circle" : "radio-button-unchecked"}
                              size={20}
                              color={task.completed ? "#10B981" : "rgba(255, 255, 255, 0.7)"}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.taskTextContainer}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleToggleTask(category.id, task.id);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.taskText,
                              task.completed && styles.taskTextCompleted
                            ]}>
                              {task.title}
                            </Text>
                          </TouchableOpacity>
                          {/* Timer icon next to delete button if timer exists */}
                          {task.timer && (
        <TouchableOpacity
          style={styles.timerIconButton}
          onPress={(e) => {
            e.stopPropagation();
            setActiveTimers(timers => {
              // If timer for this task is not already active, add it
              if (!timers.some(t => t.taskId === task.id && t.duration === Number(task.timer))) {
                return [...timers, { taskId: task.id, title: task.title, duration: Number(task.timer), start: Date.now() }];
              }
              return timers;
            });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="timer" size={18} color="#4ECDC4" />
        </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(category.id, task.id);
                            }}
                            style={styles.deleteButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <MaterialIcons name="close" size={18} color="rgba(255, 255, 255, 0.9)" />
                          </TouchableOpacity>
                        </View>
                      ))}
                      {category.tasks.length > 3 && (
                        <Text style={styles.moreTasksText}>
                          +{category.tasks.length - 3} more tasks
                        </Text>
                      )}
                    </>
                  )}
                </View>
                
                {/* Add Task Area */}
                <TouchableOpacity
                  style={styles.addTaskArea}
                  onPress={() => setShowAddTask(category.id)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="add" size={20} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.addTaskText}>Add Task</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.deleteCategoryButton}
                onPress={() => handleDeleteCategory(category.id, category.name)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete-outline" size={22} color="rgba(255, 255, 255, 0.9)" />
              </TouchableOpacity>
            </LinearGradient>
          );
          })}
        </View>

        {/* Empty State */}
        {categories.length === 0 && (
          <View style={[styles.emptyContainer, user?.preferences.theme === 'dark' && styles.darkCard]}>
            <MaterialIcons name="folder-open" size={64} color="#6366F1" />
            <Text style={[styles.emptyTitle, user?.preferences.theme === 'dark' && styles.darkText]}>No Categories Yet</Text>
            <Text style={[styles.emptySubtitle, user?.preferences.theme === 'dark' && styles.darkSubText]}>
              Create your first category to start organizing your tasks
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowAddCategory(true)}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.createButtonText}>Create Category</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add Category Button */}
        {categories.length > 0 && (
          <TouchableOpacity 
            style={[styles.addCategoryButton, user?.preferences.theme === 'dark' && styles.darkAddCategoryButton]}
            onPress={() => setShowAddCategory(true)}
          >
            <MaterialIcons name="add" size={24} color="#6366F1" />
            <Text style={styles.addCategoryText}>Add New Category</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategory}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddCategory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, user?.preferences.theme === 'dark' && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Add New Category</Text>
            <TextInput
              style={[
                styles.modalInput,
                user?.preferences.theme === 'dark' && styles.darkModalInput
              ]}
              placeholder="Category name"
              placeholderTextColor={user?.preferences.theme === 'dark' ? '#CCCCCC' : '#999'}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddCategory(false);
                  setNewCategoryName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddCategory}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        visible={showAddTask !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddTask(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, user?.preferences.theme === 'dark' && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Add New Task</Text>
            <TextInput
              style={[
                styles.modalInput,
                user?.preferences.theme === 'dark' && styles.darkModalInput
              ]}
              placeholder="Task title"
              placeholderTextColor={user?.preferences.theme === 'dark' ? '#CCCCCC' : '#999'}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddTask(null);
                  setNewTaskTitle('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => showAddTask && handleAddTask(showAddTask)}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ask for Timer Modal */}
      <Modal
        visible={askTimer}
        transparent
        animationType="fade"
        onRequestClose={() => setAskTimer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, user?.preferences.theme === 'dark' && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Add Timer?</Text>
            <Text style={{ marginBottom: 16 }}>Would you like to add a timer to this task?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setAskTimer(false);
                  if (pendingTaskCategory && pendingTaskTitle) {
                    handleCreateTaskWithTimer(pendingTaskCategory, pendingTaskTitle, null);
                  }
                }}
              >
                <Text style={styles.cancelButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setAskTimer(false);
                  setShowTimerModal(true);
                }}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Timer Modal */}
      <TimerModal
        visible={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        onSetTimer={(seconds) => {
          setShowTimerModal(false);
          if (pendingTaskCategory && pendingTaskTitle) {
            handleCreateTaskWithTimer(pendingTaskCategory, pendingTaskTitle, seconds);
          }
        }}
        theme={user?.preferences.theme}
      />

      {/* Delete Task Confirmation Modal */}
      {showDeleteTaskModal && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!showDeleteTaskModal}
          onRequestClose={() => setShowDeleteTaskModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, user?.preferences.theme === 'dark' && styles.darkCard]}>
              <MaterialIcons name="delete" size={48} color="#FF6B6B" style={styles.modalIcon} />
              <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Delete Task</Text>
              <Text style={[styles.modalText, user?.preferences.theme === 'dark' && styles.darkText]}>
                Are you sure you want to delete this task?
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowDeleteTaskModal(null)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]} 
                  onPress={confirmDeleteTask}
                >
                  <Text style={styles.confirmButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Delete Category Confirmation Modal */}
      {showDeleteCategoryModal && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!showDeleteCategoryModal}
          onRequestClose={() => setShowDeleteCategoryModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, user?.preferences.theme === 'dark' && styles.darkCard]}>
              <MaterialIcons name="folder-delete" size={48} color="#FF6B6B" style={styles.modalIcon} />
              <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Delete Category</Text>
              <Text style={[styles.modalText, user?.preferences.theme === 'dark' && styles.darkText]}>
                Are you sure you want to delete "{showDeleteCategoryModal.name}"?
                {(() => {
                  const category = categories.find(c => c.id === showDeleteCategoryModal.categoryId);
                  const taskCount = category?.tasks.length || 0;
                  return taskCount > 0 ? ` This will also delete ${taskCount} task${taskCount > 1 ? 's' : ''} in this category.` : '';
                })()}
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowDeleteCategoryModal(null)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]} 
                  onPress={confirmDeleteCategory}
                >
                  <Text style={styles.confirmButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <Toast {...toast} onHide={() => {}} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  darkContainer: {
    backgroundColor: '#0F1419',
  },
  darkText: {
    color: '#F8FAFC',
  },
  darkSubText: {
    color: '#94A3B8',
  },
  darkCard: {
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginRight: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 5,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  darkAddButton: {
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryCard: {
    borderRadius: 24,
    marginBottom: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  categoryContent: {
    padding: 24,
    minHeight: 180,
  },
  categoryHeader: {
    marginBottom: 20,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 60, // Add padding to avoid overlap with delete button
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.3,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  deleteCategoryButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  progressBar: {
    marginBottom: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    width: PROGRESS_BAR_WIDTH,
    alignSelf: 'flex-start',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tasksList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginVertical: 2,
  },
  checkBox: {
    padding: 6,
    marginRight: 12,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 22,
    marginRight: 8,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    textDecorationColor: 'rgba(255, 255, 255, 0.8)',
    opacity: 0.7,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginLeft: 8,
  },
  timerIconButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginLeft: 4,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreTasksText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 12,
    fontWeight: '500',
  },
  deleteHintText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 6,
    fontStyle: 'italic',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    marginVertical: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 20,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  darkAddCategoryButton: {
    backgroundColor: '#1E293B',
    borderColor: '#6366F1',
  },
  addCategoryText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '88%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  darkModalContent: {
    backgroundColor: '#1E293B',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    marginBottom: 28,
    backgroundColor: '#F8FAFC',
    fontWeight: '500',
  },
  darkModalInput: {
    backgroundColor: '#334155',
    borderColor: '#475569',
    color: '#F8FAFC',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  modalButton: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  confirmButton: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 16,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  // Modal styles
  modalIcon: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
    color: '#64748B',
    lineHeight: 26,
    fontWeight: '500',
  },
  addTaskArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  addTaskText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  taskTextContainer: {
    flex: 1,
    paddingVertical: 4,
    marginRight: 8,
  },
});

export default TasksScreen;
