import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  radius?: number;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  rim?: boolean;
  highlight?: boolean;
  elevated?: boolean;
}

export default function LiquidGlass({
  children,
  style,
  radius = 16,
  intensity = 60,
  tint = 'dark',
  rim = true,
  highlight = true,
  elevated = false,
}: Props) {
  const blurTint = tint === 'light' ? 'extraLight' : tint === 'dark' ? 'dark' : 'default';

  const baseFill = tint === 'light'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(18, 18, 18, 0.45)';

  const rimColor = tint === 'light'
    ? 'rgba(255, 255, 255, 0.25)'
    : 'rgba(255, 255, 255, 0.10)';

  return (
    <View
      style={[
        styles.wrap,
        { borderRadius: radius },
        elevated && styles.elevated,
        style,
      ]}
    >
      <BlurView
        tint={blurTint}
        intensity={intensity}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}
      />

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: baseFill, borderRadius: radius },
        ]}
      />

      {highlight && (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)', 'transparent']}
          locations={[0, 0.2, 0.5]}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      )}

      {rim && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              borderWidth: 1,
              borderColor: rimColor,
            },
          ]}
        />
      )}

      {rim && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: 'rgba(0, 0, 0, 0.3)',
              margin: -StyleSheet.hairlineWidth,
            },
          ]}
        />
      )}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
