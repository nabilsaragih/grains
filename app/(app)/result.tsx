'use client';

import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FooterNav from '@/components/FooterNav';

export default function ResultScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-2xl font-montserrat-bold text-[#0F2E04]">Rekomendasi Produk</Text>
          <Text className="text-center font-montserrat text-base text-[#4B5563]">
            Tampilkan rekomendasi produk sehat berdasarkan analisis nutrisi di sini.
          </Text>
        </View>
      </View>
      <FooterNav />
    </SafeAreaView>
  );
}
