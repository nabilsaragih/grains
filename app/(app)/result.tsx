'use client';

import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import FooterNav from '@/components/FooterNav';

type Recommendation = {
  rank: number;
  brand: string;
  category: string;
  reasons: string[];
  nutrition?: {
    sugar_g_100g?: number;
    sodium_mg_100g?: number;
    protein_g_100g?: number;
    fiber_g_100g?: number;
    fat_sat_g_100g?: number;
  };
};

type ManualSearchResponse = {
  status?: string;
  answer?: {
    recommendations?: Recommendation[];
    summary?: string;
  };
};

function RecommendationCard({ item }: { item: Recommendation }) {
  const nutrition = item.nutrition ?? {};

  return (
    <View className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
      <View className="mb-2 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="mb-1 flex-row items-center gap-2">
            <View className="rounded-full bg-[#E6F4E6] px-3 py-1">
              <Text className="text-xs font-montserrat-bold text-[#0F2E04]">#{item.rank}</Text>
            </View>
            <Text className="text-lg font-montserrat-bold text-[#0F2E04]">{item.brand}</Text>
          </View>
          <Text className="font-montserrat text-xs text-[#6B7280]">{item.category}</Text>
        </View>
      </View>

      {!!item.reasons?.length && (
        <View className="mb-3">
          <Text className="mb-1 font-montserrat-bold text-sm text-[#0F2E04]">Mengapa direkomendasikan</Text>
          <View className="gap-1">
            {item.reasons.map((reason, idx) => (
              <Text key={idx} className="font-montserrat text-sm text-[#374151]">
                - {reason}
              </Text>
            ))}
          </View>
        </View>
      )}

      <View className="gap-1.5">
        <Text className="font-montserrat-bold text-sm text-[#0F2E04]">Ringkasan nutrisi (per 100g)</Text>
        <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
          <Text className="font-montserrat text-sm text-[#374151]">
            Gula: {nutrition.sugar_g_100g ?? 0} g
          </Text>
          <Text className="font-montserrat text-sm text-[#374151]">
            Sodium: {nutrition.sodium_mg_100g ?? 0} mg
          </Text>
          <Text className="font-montserrat text-sm text-[#374151]">
            Protein: {nutrition.protein_g_100g ?? 0} g
          </Text>
          <Text className="font-montserrat text-sm text-[#374151]">
            Serat: {nutrition.fiber_g_100g ?? 0} g
          </Text>
          <Text className="font-montserrat text-sm text-[#374151]">
            Lemak jenuh: {nutrition.fat_sat_g_100g ?? 0} g
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ResultScreen() {
  const params = useLocalSearchParams<{ payload?: string | string[] }>();

  const parsedPayload = useMemo<ManualSearchResponse | null>(() => {
    const raw = Array.isArray(params.payload) ? params.payload[0] : params.payload;

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(decodeURIComponent(raw)) as ManualSearchResponse;
    } catch {
      return null;
    }
  }, [params.payload]);

  const recommendations = useMemo(() => {
    const recs = parsedPayload?.answer?.recommendations ?? [];
    return [...recs].sort((a, b) => a.rank - b.rank).slice(0, 6);
  }, [parsedPayload]);

  return (
    <SafeAreaView className="flex-1 bg-[#F3F7F0]">
      <View className="flex-1 px-6 pt-8 pb-4">
        <View className="mb-5 rounded-3xl bg-[#13360A] p-4 shadow-lg shadow-black/10">
          <Text className="text-lg font-montserrat-bold text-white">Hasil Rekomendasi</Text>
          <Text className="mt-1 font-montserrat text-sm text-[#E6F4E6]">
            Alternatif minuman lebih sehat berdasarkan analisis Anda.
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 140 }}
        >
          {parsedPayload ? (
            <>
              {parsedPayload.answer?.summary ? (
                <View className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
                  <Text className="mb-1 font-montserrat-bold text-sm text-[#0F2E04]">Ringkasan</Text>
                  <Text className="font-montserrat text-sm text-[#374151]">
                    {parsedPayload.answer.summary}
                  </Text>
                </View>
              ) : null}

              {recommendations.length ? (
                <View className="gap-3">
                  {recommendations.map((item) => (
                    <RecommendationCard key={item.rank} item={item} />
                  ))}
                </View>
              ) : (
                <Text className="font-montserrat text-sm text-[#6B7280]">
                  Tidak ada rekomendasi yang tersedia.
                </Text>
              )}
            </>
          ) : (
            <Text className="font-montserrat text-sm text-[#6B7280]">
              Tidak ada data untuk ditampilkan. Silakan kirim pencarian manual terlebih dahulu.
            </Text>
          )}
        </ScrollView>
      </View>
      <FooterNav />
    </SafeAreaView>
  );
}
