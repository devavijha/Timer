import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector, useDispatch, useSafeArea } from '../utils/hooks';
import { updateUserPreferences, setUser } from '../store/userSlice';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { signOut } = useAuth();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const { goals } = useSelector((state) => state.goals);
  const { habits } = useSelector((state) => state.habits);
  const { sessions } = useSelector((state) => state.meditation);
  const { categories } = useSelector((state) => state.tasks);
  const safeAreaInsets = useSafeArea();
  const { showSuccess, showError, showInfo, toast } = useToast();

  // Modal states
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Edit profile states
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  const handleToggleNotifications = (value: boolean) => {
    dispatch(updateUserPreferences({ notifications: value }));
    showSuccess(`Notifications ${value ? 'enabled' : 'disabled'}`, 'Settings Updated');
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    dispatch(updateUserPreferences({ theme }));
    setShowThemeModal(false);
    showSuccess(`Switched to ${theme} theme`, 'Theme Updated');
  };

  const handleEditProfile = () => {
    if (user) {
      dispatch(setUser({
        ...user,
        name: editName,
        email: editEmail,
      }));
      setShowEditProfileModal(false);
      showSuccess('Profile updated successfully!', 'Success');
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setShowLogoutModal(false);
      await signOut();
      showSuccess('You have been signed out successfully.', 'Goodbye!');
    } catch (error) {
      console.error('Logout error:', error);
      showError('Failed to sign out. Please try again.', 'Error');
    }
  };

  // Calculate user statistics
  const totalTasks = categories.reduce((total, category) => total + category.tasks.length, 0);
  const completedTasks = categories.reduce((total, category) => 
    total + category.tasks.filter(task => task.completed).length, 0);
  const activeStreaks = habits.filter(habit => habit.streak > 0).length;
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak)) : 0;

  return (
    <SafeAreaView style={[styles.container, user?.preferences.theme === 'dark' && styles.darkContainer]}>
      <View style={[styles.header, { paddingTop: safeAreaInsets.top + 10 }]}>
        <Text style={[styles.title, user?.preferences.theme === 'dark' && styles.darkText]}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <TouchableOpacity 
          style={[styles.userSection, user?.preferences.theme === 'dark' && styles.darkCard]}
          onPress={() => setShowEditProfileModal(true)}
        >
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={50} color="#4ECDC4" />
          </View>
          <Text style={[styles.userName, user?.preferences.theme === 'dark' && styles.darkText]}>
            {user?.name || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          <View style={styles.editHint}>
            <MaterialIcons name="edit" size={16} color="#4ECDC4" />
            <Text style={styles.editHintText}>Tap to edit</Text>
          </View>
        </TouchableOpacity>

        {/* Enhanced Stats */}
        <View style={styles.statsSection}>
          <TouchableOpacity 
            style={[styles.statCard, user?.preferences.theme === 'dark' && styles.darkCard]}
            onPress={() => showInfo(`You have completed ${completedTasks} out of ${totalTasks} tasks. Keep up the great work!`, 'Tasks')}
          >
            <MaterialIcons name="check-circle" size={30} color="#4CAF50" />
            <Text style={[styles.statNumber, user?.preferences.theme === 'dark' && styles.darkText]}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, user?.preferences.theme === 'dark' && styles.darkCard]}
            onPress={() => showInfo(`You have ${activeStreaks} active habit streaks. Your longest streak is ${longestStreak} days! 🔥`, 'Habits')}
          >
            <MaterialIcons name="timeline" size={30} color="#FF9800" />
            <Text style={[styles.statNumber, user?.preferences.theme === 'dark' && styles.darkText]}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, user?.preferences.theme === 'dark' && styles.darkCard]}
            onPress={() => showInfo(`You have ${goals.length} active goals with an average progress of ${Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length || 0)}%`, 'Goals')}
          >
            <MaterialIcons name="spa" size={30} color="#4ECDC4" />
            <Text style={[styles.statNumber, user?.preferences.theme === 'dark' && styles.darkText]}>{goals.length}</Text>
            <Text style={styles.statLabel}>Active Goals</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={[styles.settingsSection, user?.preferences.theme === 'dark' && styles.darkCard]}>
          <Text style={[styles.sectionTitle, user?.preferences.theme === 'dark' && styles.darkText]}>Settings</Text>
          
          <View style={[styles.settingItem, user?.preferences.theme === 'dark' && styles.darkBorder]}>
            <View style={styles.settingInfo}>
              <MaterialIcons 
                name="notifications" 
                size={24} 
                color={user?.preferences.theme === 'dark' ? '#ccc' : '#666'} 
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, user?.preferences.theme === 'dark' && styles.darkText]}>
                  Notifications
                </Text>
              </View>
            </View>
            <Switch
              value={user?.preferences.notifications || false}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
              thumbColor={user?.preferences.notifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity 
            style={[styles.settingItem, user?.preferences.theme === 'dark' && styles.darkBorder]}
            onPress={() => setShowThemeModal(true)}
          >
            <View style={styles.settingInfo}>
              <MaterialIcons 
                name="palette" 
                size={24} 
                color={user?.preferences.theme === 'dark' ? '#ccc' : '#666'} 
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, user?.preferences.theme === 'dark' && styles.darkText]}>
                  Theme
                </Text>
                <Text style={[styles.settingSubtext, user?.preferences.theme === 'dark' && styles.darkText]}>
                  {user?.preferences.theme === 'dark' ? 'Dark' : 'Light'}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#BDC3C7" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, user?.preferences.theme === 'dark' && styles.darkBorder]}
            onPress={() => showInfo('For support, please contact us at support@timerapp.com or visit our FAQ section in the app.', 'Help & Support')}
          >
            <View style={styles.settingInfo}>
              <MaterialIcons 
                name="help" 
                size={24} 
                color={user?.preferences.theme === 'dark' ? '#ccc' : '#666'} 
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, user?.preferences.theme === 'dark' && styles.darkText]}>
                  Help & Support
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#BDC3C7" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomWidth: 0 }]}
            onPress={() => setShowAboutModal(true)}
          >
            <View style={styles.settingInfo}>
              <MaterialIcons 
                name="info" 
                size={24} 
                color={user?.preferences.theme === 'dark' ? '#ccc' : '#666'} 
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, user?.preferences.theme === 'dark' && styles.darkText]}>
                  About
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#BDC3C7" />
          </TouchableOpacity>

          {/* Focus Mode Button */}
          <TouchableOpacity 
            style={[styles.settingItem, user?.preferences.theme === 'dark' && styles.darkBorder]}
            onPress={() => navigation.navigate('FocusModeScreen' as never)}
          >
            <View style={styles.settingInfo}>
              <MaterialIcons name="do-not-disturb" size={24} color={user?.preferences.theme === 'dark' ? '#ccc' : '#4ECDC4'} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, user?.preferences.theme === 'dark' && styles.darkText]}>Focus Mode</Text>
                <Text style={[styles.settingSubtext, user?.preferences.theme === 'dark' && styles.darkText]}>Enter distraction-free mode</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#BDC3C7" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity 
          style={[styles.logoutButton, user?.preferences.theme === 'dark' && styles.darkCard]} 
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={24} color="#FF6B6B" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, user?.preferences.theme === 'dark' && styles.darkCard]}>
            <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>
              Choose Theme
            </Text>
            <TouchableOpacity onPress={() => setShowThemeModal(false)}>
              <MaterialIcons name="close" size={24} color={user?.preferences.theme === 'dark' ? '#F8FAFC' : '#666'} />
            </TouchableOpacity>
            </View>
            
            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  user?.preferences.theme === 'light' && styles.selectedOption,
                  user?.preferences.theme === 'dark' && {
                    backgroundColor: '#23272F',
                    borderColor: 'transparent',
                  }
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <MaterialIcons name="light-mode" size={24} color={user?.preferences.theme === 'dark' ? '#4ECDC4' : '#4ECDC4'} />
                <Text style={[styles.themeOptionText, user?.preferences.theme === 'dark' && { color: '#F8FAFC' }]}>
                  Light Theme
                </Text>
                {user?.preferences.theme === 'light' && (
                  <MaterialIcons name="check" size={20} color="#4ECDC4" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  user?.preferences.theme === 'dark' && styles.selectedOption,
                  user?.preferences.theme === 'dark' && {
                    backgroundColor: '#23272F',
                    borderColor: '#4ECDC4',
                  }
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <MaterialIcons name="dark-mode" size={24} color={user?.preferences.theme === 'dark' ? '#4ECDC4' : '#4ECDC4'} />
                <Text style={[styles.themeOptionText, user?.preferences.theme === 'dark' && { color: '#F8FAFC' }]}>
                  Dark Theme
                </Text>
                {user?.preferences.theme === 'dark' && (
                  <MaterialIcons name="check" size={20} color="#4ECDC4" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, user?.preferences.theme === 'dark' && styles.darkCard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>
                About Timer App
              </Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <MaterialIcons name="close" size={24} color={user?.preferences.theme === 'dark' ? '#F8FAFC' : '#666'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.aboutContent} showsVerticalScrollIndicator={false}>
              {/* App Header */}
              <View style={styles.aboutHeader}>
                <View style={[styles.appIcon, user?.preferences.theme === 'dark' && { backgroundColor: '#23272F' }]}>
                  <MaterialIcons name="timer" size={40} color="#4ECDC4" />
                </View>
                <Text style={[styles.aboutTitle, user?.preferences.theme === 'dark' && styles.darkText]}>
                  Timer - Productivity & Wellness
                </Text>
                <Text style={[styles.versionText, user?.preferences.theme === 'dark' && styles.darkText]}>
                  Version 1.0.0 • Build 2025.1
                </Text>
                <Text style={[styles.descriptionText, user?.preferences.theme === 'dark' && { color: '#CCCCCC' }]}>
                  Your all-in-one companion for building better habits, managing tasks, and achieving mindfulness through structured productivity.
                </Text>
              </View>
              
              {/* Key Features */}
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutSubtitle, user?.preferences.theme === 'dark' && styles.darkText]}>
                  ✨ Key Features
                </Text>
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                    <Text style={[styles.featureText, user?.preferences.theme === 'dark' && { color: '#CCCCCC' }]}>
                      Smart Task Management with customizable categories and priorities
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="trending-up" size={16} color="#FF9800" />
                    <Text style={[styles.featureText, user?.preferences.theme === 'dark' && { color: '#CCCCCC' }]}>
                      Advanced Habit Tracking with streak analytics and progress insights
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="spa" size={16} color="#4ECDC4" />
                    <Text style={[styles.featureText, user?.preferences.theme === 'dark' && { color: '#CCCCCC' }]}>
                      Guided Meditation Sessions with customizable timers and sounds
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="analytics" size={16} color="#9C27B0" />
                    <Text style={[styles.featureText, user?.preferences.theme === 'dark' && { color: '#CCCCCC' }]}>
                      Comprehensive Progress Analytics and goal visualization
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="calendar-today" size={16} color="#2196F3" />
                    <Text style={[styles.featureText, user?.preferences.theme === 'dark' && { color: '#CCCCCC' }]}>
                      Calendar Integration with activity tracking and reminders
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="dark-mode" size={16} color="#616161" />
                    <Text style={[styles.featureText, user?.preferences.theme === 'dark' && { color: '#CCCCCC' }]}>
                      Dark/Light Theme support for comfortable viewing
                    </Text>
                  </View>
                </View>
              </View>
              
            

              {/* Data & Privacy */}
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutSubtitle, user?.preferences.theme === 'dark' && styles.darkText]}>
                  🔒 Privacy & Security
                </Text>
                <Text style={[styles.aboutText, user?.preferences.theme === 'dark' && { color: '#CCCCCC' }]}>
                  Your privacy is our priority. All data is encrypted and stored securely. We follow industry-standard security practices and never share your personal information with third parties. Your habits, tasks, and meditation data remain completely private and under your control.
                </Text>
              </View>
              
              {/* Credits */}
              <View style={[styles.aboutSection, styles.creditsSection]}>
                <Text style={[styles.creditsText, user?.preferences.theme === 'dark' && { color: '#4ECDC4' }]}>Made with ❤️ for productivity enthusiasts</Text>
                <Text style={[styles.creditsSubtext, user?.preferences.theme === 'dark' && { color: '#CCCCCC' }]}>Empowering mindful productivity, one habit at a time</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, user?.preferences.theme === 'dark' && styles.darkCard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
                <MaterialIcons name="close" size={24} color={user?.preferences.theme === 'dark' ? '#F8FAFC' : '#666'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.editForm}>
              <Text style={[styles.inputLabel, user?.preferences.theme === 'dark' && styles.darkText]}>
                Name
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  user?.preferences.theme === 'dark' && styles.darkTextInput
                ]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={user?.preferences.theme === 'dark' ? '#888' : '#BDC3C7'}
              />
              
              <Text style={[styles.inputLabel, user?.preferences.theme === 'dark' && styles.darkText]}>
                Email
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  user?.preferences.theme === 'dark' && styles.darkTextInput
                ]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                placeholderTextColor={user?.preferences.theme === 'dark' ? '#888' : '#BDC3C7'}
                keyboardType="email-address"
              />
              
              <TouchableOpacity style={styles.saveButton} onPress={handleEditProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.logoutModalOverlay}>
          <View style={[styles.logoutModalContent, user?.preferences.theme === 'dark' && styles.darkCard]}>
            <View style={styles.logoutModalIcon}>
              <MaterialIcons name="logout" size={40} color="#FF6B6B" />
            </View>
            
            <View style={styles.logoutModalHeader}>
              <Text style={[styles.logoutModalTitle, user?.preferences.theme === 'dark' && styles.darkText]}>
                Sign Out
              </Text>
              <Text style={[styles.logoutModalText, user?.preferences.theme === 'dark' && styles.darkText]}>
                Are you sure you want to sign out of your account?
              </Text>
            </View>
            
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity 
                style={[styles.logoutModalButton, styles.logoutCancelButton]} 
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.logoutModalButton, styles.logoutConfirmButton]} 
                onPress={confirmLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutConfirmButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast {...toast} onHide={() => {}} />
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
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  darkText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  
  // User Section
  userSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#2A2A2A',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 10,
  },
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  editHintText: {
    fontSize: 12,
    color: '#4ECDC4',
    marginLeft: 5,
  },
  
  // Stats Section
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
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
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  
  // Settings Section
  settingsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
    minHeight: 60,
  },
  darkBorder: {
    borderBottomColor: '#3A3A3A',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  settingSubtext: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  
  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 20,
    marginBottom: 30,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
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
    maxHeight: '80%',
    minHeight: '50%',
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
  
  // Theme Modal
  themeOptions: {
    padding: 20,
    gap: 15,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#E8F5F1',
    borderColor: '#4ECDC4',
  },
  themeOptionText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 15,
    flex: 1,
    fontWeight: '500',
  },
  
  // About Modal
  aboutContent: {
    padding: 20,
    maxHeight: 400,
  },
  aboutHeader: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  appIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 10,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  aboutSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 10,
  },
  miniStat: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
  },
  miniStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 5,
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  contactList: {
    marginTop: 10,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  creditsSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 10,
  },
  creditsText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  creditsSubtext: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Edit Profile Modal
  editForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  darkTextInput: {
    backgroundColor: '#3A3A3A',
    borderColor: '#555',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Logout Modal Styles
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  logoutModalIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#FFE6E6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutModalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  logoutModalText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  logoutModalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  logoutCancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E1E8ED',
  },
  logoutCancelButtonText: {
    color: '#5A6C7D',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutConfirmButton: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
