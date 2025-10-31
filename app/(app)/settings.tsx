'use client';

import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FooterNav from '@/components/FooterNav';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        <Text className="text-3xl font-montserrat-bold text-[#0F2E04]">Pengaturan</Text>
        <Text className="mt-2 font-montserrat text-base text-[#4B5563]">
          Sesuaikan preferensi aplikasi dan kelola keamanan akun Anda.
        </Text>

        <View className="mt-8 gap-4">
          <View className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <Text className="text-lg font-montserrat-bold text-[#0F2E04]">Preferensi Notifikasi</Text>
            <Text className="mt-2 font-montserrat text-sm text-[#4B5563]">
              Atur pemberitahuan untuk rekomendasi produk dan pengingat nutrisi Anda.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
            onPress={() => router.push('/(app)/security')}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-montserrat-bold text-[#0F2E04]">Keamanan Akun</Text>
                <Text className="mt-2 font-montserrat text-sm text-[#4B5563]">
                  Ubah password, kelola perangkat yang terhubung, dan aktifkan autentikasi tambahan.
                </Text>
              </View>
              <Text className="ml-4 text-2xl text-[#1A770A]">{'>'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <FooterNav />
    </SafeAreaView>
  );
}
