import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const providers = [
  { name: 'Sign up with email', icon: require('../../assets/email-icon.png') },
  { name: 'Sign up with Google', icon: require('../../assets/google-icon.png') },
  { name: 'Sign up with Kakao', icon: require('../../assets/kakao-icon.png') },
  { name: 'Sign up with Naver', icon: require('../../assets/naver-icon.png') },
  { name: 'Sign up with Apple', icon: require('../../assets/apple-icon.png') },
];

const SignUpScreen: React.FC<{ onSignIn?: () => void }> = ({ onSignIn }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.appName}>YPT</Text>
      <Text style={styles.title}>Sign up</Text>
      <View style={styles.buttonList}>
        {providers.map((provider) => (
          <TouchableOpacity key={provider.name} style={styles.providerButton}>
            <View style={styles.iconRow}>
              <Image source={provider.icon} style={styles.icon} />
              <Text style={styles.providerText}>{provider.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.legalRow}>
        <Text style={styles.link}>Privacy Policy</Text>
        <Text style={styles.link}>Terms of Service</Text>
      </View>
      <View style={styles.signInRow}>
        <Text style={styles.signInText}>Already have an account? </Text>
        <TouchableOpacity onPress={onSignIn}>
          <Text style={styles.signInLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
    padding: 24,
    justifyContent: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF9999',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonList: {
    marginBottom: 32,
  },
  providerButton: {
    backgroundColor: '#23272F',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  providerText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 18,
  },
  link: {
    color: '#4ECDC4',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: '#F8FAFC',
    fontSize: 15,
  },
  signInLink: {
    color: '#FF9999',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 4,
  },
});

export default SignUpScreen;
