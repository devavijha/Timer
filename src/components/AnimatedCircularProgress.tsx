import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface AnimatedCircularProgressProps {
  size: number;
  width: number;
  fill: number; // percent 0-100
  tintColor: string;
  backgroundColor: string;
}

export const AnimatedCircularProgress: React.FC<AnimatedCircularProgressProps> = ({ size, width, fill, tintColor, backgroundColor }) => {
  const radius = (size - width) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fill / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={backgroundColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={width}
        />
        <Circle
          stroke={tintColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={width}
          strokeDasharray={`${circumference},${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({});
