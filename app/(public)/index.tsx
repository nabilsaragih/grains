'use client';

import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import FooterWave from '@/components/FooterWave';
import { useAuth } from '@/src/auth/AuthProvider';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function LandingScreen() {
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();
  const fadeValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/(app)/manual');
    }
  }, [isAuthenticated, isReady, router]);

  if (isReady && isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#4FC025', '#0E2903']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          className="flex-1 items-center justify-center"
        >
          <ActivityIndicator color="#fff" />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#4FC025', '#0E2903']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="flex-1 items-center justify-center"
      >
        <Text
          className="text-6xl font-bold text-white font-montserrat"
          style={{
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 4,
          }}
        >
          GRAINS
        </Text>
        <FooterWave height={195} />

        <View className="mt-2 flex-row items-center justify-center">
          <Text className="mr-2 text-xs font-marcellus text-white">Gemma-based RAG for Intelligent</Text>
          <Text className="text-4xl font-love-light text-white">Nutrition System</Text>
        </View>

        {!isReady ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View className="mt-10 w-full px-6">
              <AnimatedTouchableOpacity
                className="w-full items-center rounded-3xl bg-white px-6 py-3 shadow-md"
                activeOpacity={1}
                style={{ opacity: fadeValue }}
                onPress={() => {
                  Animated.sequence([
                    Animated.timing(fadeValue, {
                      toValue: 0.4,
                      duration: 120,
                      easing: Easing.out(Easing.quad),
                      useNativeDriver: true,
                    }),
                    Animated.timing(fadeValue, {
                      toValue: 1,
                      duration: 180,
                      easing: Easing.in(Easing.quad),
                      useNativeDriver: true,
                    }),
                  ]).start(() => {
                    router.push('/login');
                  });
                }}
              >
                <Text className="text-base font-montserrat-bold text-[#126007]">Login</Text>
              </AnimatedTouchableOpacity>
            </View>

            <View className="mt-3 w-full flex-row justify-center px-6">
              <Text className="mr-1 text-sm font-montserrat text-white">Belum punya akun?</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/signup')}>
                <Text className="text-sm font-montserrat text-white underline underline-offset-4">Daftar sekarang</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}
