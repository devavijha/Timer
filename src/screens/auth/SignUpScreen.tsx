import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

interface SignUpScreenProps {
  navigation: any;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { signUp, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showError('Please fill in all fields', 'Validation Error');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match', 'Validation Error');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters long', 'Validation Error');
      return;
    }

    try {
      setIsLoading(true);
      await signUp(email.trim(), password, name.trim());
      showSuccess('Account created successfully!', 'Welcome Aboard');
    } catch (error: any) {
      showError(error.message || 'An error occurred during sign up', 'Sign Up Failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return <LoadingSpinner text="Creating your account..." overlay />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4ECDC4', '#44B5AC']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <MaterialIcons name="person-add" size={64} color="white" />
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Start your wellness journey today</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>

              <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
                <Text style={styles.signUpButtonText}>Create Account</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')} 
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>Already have an account? Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
      
      {/* Modern Toast Component */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        title={toast.title}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 20, marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center' },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, paddingVertical: 4 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, paddingVertical: 16, color: '#333' },
  eyeIcon: { padding: 4 },
  signUpButton: { backgroundColor: 'white', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 24 },
  signUpButtonText: { color: '#4ECDC4', fontSize: 18, fontWeight: 'bold' },
  loginButton: { alignItems: 'center' },
  loginButtonText: { color: 'white', fontSize: 14, fontWeight: '500' },
});

export default SignUpScreen;