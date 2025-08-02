import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.gridBg}>
        {/* Grid background using overlayed lines */}
        {[...Array(8)].map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: i * 60 }]} />
        ))}
        {[...Array(4)].map((_, i) => (
          <View key={i} style={[styles.gridLineVertical, { left: i * 90 }]} />
        ))}
      </View>
      <View style={styles.centerContent}>
        <View style={styles.iconCircle}>
          {/* Green hourglass icon */}
          <Image source={require('../../assets/icon.png')} style={styles.icon} />
        </View>
            <Text style={styles.title}>Boost your productivity and wellness</Text>
      </View>
         <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('NicknameScreen' as never)}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 24,
  },
  gridBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  centerContent: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 60,
    zIndex: 1,
  },
  iconCircle: {
    backgroundColor: '#4ECDC4',
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  icon: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  trustText: {
    fontSize: 16,
    color: '#FFE066',
    textAlign: 'center',
    marginBottom: 32,
  },
  bold: {
    fontWeight: '700',
    color: '#FFE066',
  },
  button: {
    backgroundColor: '#4ECDC4',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 18,
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    color: '#0F1419',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  privacyText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  link: {
    color: '#4ECDC4',
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;
