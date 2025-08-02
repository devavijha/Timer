import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onHide: () => void;
  title?: string;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  duration = 4000,
  onHide,
  title,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          colors: ['#10B981', '#059669'],
          icon: 'check-circle',
          borderColor: '#10B981',
        };
      case 'error':
        return {
          colors: ['#EF4444', '#DC2626'],
          icon: 'error',
          borderColor: '#EF4444',
        };
      case 'warning':
        return {
          colors: ['#F59E0B', '#D97706'],
          icon: 'warning',
          borderColor: '#F59E0B',
        };
      case 'info':
      default:
        return {
          colors: ['#3B82F6', '#2563EB'],
          icon: 'info',
          borderColor: '#3B82F6',
        };
    }
  };

  const config = getToastConfig();

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.toastWrapper,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={hideToast}
          style={styles.toastContainer}
        >
          <LinearGradient
            colors={[config.colors[0], config.colors[1], `${config.colors[1]}F0`] as const}
            style={styles.toastGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Background pattern */}
            <View style={styles.backgroundPattern}>
              <View style={[styles.patternDot, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              <View style={[styles.patternDot, { backgroundColor: 'rgba(255,255,255,0.05)', top: 10, left: 20 }]} />
              <View style={[styles.patternDot, { backgroundColor: 'rgba(255,255,255,0.08)', top: 25, right: 15 }]} />
            </View>

            <View style={styles.toastContent}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconBackground, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <MaterialIcons
                    name={config.icon as any}
                    size={24}
                    color="white"
                  />
                </View>
              </View>

              <View style={styles.textContainer}>
                {title && (
                  <Text style={styles.toastTitle} numberOfLines={1}>
                    {title}
                  </Text>
                )}
                <Text style={styles.toastMessage} numberOfLines={title ? 2 : 3}>
                  {message}
                </Text>
              </View>

              <TouchableOpacity
                onPress={hideToast}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
          {
            transform: [{ scaleX: slideAnim.interpolate({
              inputRange: [-100, 0],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }) }],
          },
                ]}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  toastWrapper: {
    width: '100%',
  },
  toastContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  toastGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 5,
    left: 10,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingTop: 2,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    lineHeight: 20,
  },
  toastMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 18,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
    marginTop: 6,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});

export default Toast;
