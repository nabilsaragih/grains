import React, { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import FooterWave from '@/components/FooterWave';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)/manual');
    }
  }, [isLoading, router, user]);

  if (!isLoading && user) {
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
          style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 }}
        >
          GRAINS
        </Text>
        <FooterWave height={195} />

        <View className="mt-2 flex-row items-center justify-center">
          <Text className="text-xs font-marcellus text-white mr-2">Gemma-based RAG for Intelligent</Text>
          <Text className="text-4xl font-love-light text-white">Nutrition System</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View className="w-full px-6 mt-10">
              <Link href="/(tabs)/login" asChild>
                <TouchableOpacity className="bg-white w-full items-center px-6 py-3 rounded-3xl shadow-md active:opacity-80">
                  <Text className="text-[#126007] text-base font-montserrat-bold">Login</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View className="w-full px-6 mt-3 flex-row justify-center">
              <Text className="text-white text-sm font-montserrat mr-1">Belum punya akun?</Text>
              <Link className="text-white text-sm font-montserrat underline underline-offset-4" href="/(tabs)/signup">
                Daftar sekarang
              </Link>
            </View>
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

