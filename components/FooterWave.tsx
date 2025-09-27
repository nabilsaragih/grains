import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export type FooterWaveProps = {
  height?: number;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_HEIGHT = 165;

export default function FooterWave({ height, style }: FooterWaveProps) {
  const resolvedHeight = height ?? DEFAULT_HEIGHT;

  return (
    <View pointerEvents="none" style={[styles.container, { height: resolvedHeight }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="waveGradientOne" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6BE021" stopOpacity="0.95" />
            <Stop offset="42%" stopColor="#43A91C" stopOpacity="0.88" />
            <Stop offset="100%" stopColor="#1B5D0F" stopOpacity="0.98" />
          </LinearGradient>
          <LinearGradient id="waveGradientTwo" x1="10%" y1="100%" x2="90%" y2="0%">
            <Stop offset="0%" stopColor="#287712" stopOpacity="0.92" />
            <Stop offset="55%" stopColor="#1C5F0D" stopOpacity="0.82" />
            <Stop offset="100%" stopColor="#0A3603" stopOpacity="0.95" />
          </LinearGradient>
          <LinearGradient id="waveGradientThree" x1="0%" y1="40%" x2="100%" y2="60%">
            <Stop offset="0%" stopColor="#173E0A" stopOpacity="0.95" />
            <Stop offset="48%" stopColor="#1E5B0E" stopOpacity="0.88" />
            <Stop offset="100%" stopColor="#2C8215" stopOpacity="0.94" />
          </LinearGradient>
          <LinearGradient id="waveHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#A4F375" stopOpacity="0.55" />
            <Stop offset="50%" stopColor="#66D13F" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#3BA51E" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        <Path
          d="M0 258C130 220 240 145 380 182c140 37 220 142 360 134s260-120 420-126 180 74 280 70 180-64 0-94V320H0Z"
          fill="url(#waveGradientOne)"
        />
        <Path
          d="M0 274c140-112 310-150 470-138s240 134 380 148 290-58 372-74 176-20 280 18 176 66 208 52V320H0Z"
          fill="url(#waveGradientTwo)"
          opacity={0.92}
        />
        <Path
          d="M0 296c120-74 260-122 430-110s250 120 398 126 240-46 332-54 170-6 268 22 150 42 212 34V320H0Z"
          fill="url(#waveGradientThree)"
          opacity={0.9}
        />
        <Path
          d="M0 244c70-44 150-80 250-76s220 88 310 102 210-18 320-40 220-24 320 18 170 90 240 72V320H0Z"
          fill="url(#waveHighlight)"
          opacity={0.65}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    overflow: 'hidden',
  },
});
