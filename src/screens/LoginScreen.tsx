import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthUser } from '../store';
import { setUser, completeOnboarding } from '../store/userSlice';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    // Mock login - in real app, this would connect to authentication service
    const mockUser = {
      id: '1',
      name: 'Emma',
      email: email || 'emma@example.com',
      preferences: {
        notifications: true,
        theme: 'light' as const,
        language: 'en',
      },
    };
    
    try {
      console.log('=== LOGIN PROCESS STARTING ===');
      
      // Don't clear existing data - preserve user data across logins
      console.log('Preserving existing user data');
      
      // Set user in both slices and ensure authentication is complete
      dispatch(setUser(mockUser));
      dispatch(setAuthUser(mockUser));
      dispatch(completeOnboarding());
      
      console.log('Dispatched Redux actions');
      
      // Persist to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('onboardingComplete', 'true');
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      console.log('=== LOGIN PROCESS COMPLETE ===');
      console.log('User logged in and state persisted');
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <MaterialIcons name="spa" size={60} color="white" />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color="#BDC3C7" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#BDC3C7"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color="#BDC3C7" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#BDC3C7"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#BDC3C7"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <LinearGradient
                  colors={['#4ECDC4', '#44B5AC']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signupLink}>
                <Text style={styles.signupText}>
                  Don't have an account?{' '}
                  <Text style={styles.signupLinkText}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#2C3E50',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 30,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  signupLink: {
    alignItems: 'center',
  },
  signupText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  signupLinkText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default LoginScreen;
