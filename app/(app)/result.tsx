'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FooterNav from '@/components/FooterNav';
import { supabase } from '@/lib/supabase';
import {
  RecommendationItem,
  RecommendationResult,
  getLatestRecommendationHistory,
  getRecommendationHistoryById,
  mapHistoryRowToUiModel,
  mapResultToHistoryInsertPayload,
} from '@/lib/recommendationHistory';

const getParamValue = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

function RecommendationCard({ item }: { item: RecommendationItem }) {
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
  const router = useRouter();
  const params = useLocalSearchParams<{
    payload?: string | string[];
    historyId?: string | string[];
    id?: string | string[];
    usedQuery?: string | string[];
  }>();
  const rawPayload = getParamValue(params.payload);
  const historyIdParam = getParamValue(params.historyId) ?? getParamValue(params.id);
  const usedQueryParam = getParamValue(params.usedQuery);

  const [savedResult, setSavedResult] = useState<RecommendationResult | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const savedPayloadRef = useRef<string | null>(null);

  const parsedPayload = useMemo<RecommendationResult | null>(() => {
    const raw = rawPayload;

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(decodeURIComponent(raw)) as RecommendationResult;
    } catch {
      return null;
    }
  }, [rawPayload]);

  const isViewingSavedResult = Boolean(historyIdParam) || !parsedPayload;
  const displayedResult = isViewingSavedResult ? savedResult : parsedPayload;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/manual');
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    if (!isViewingSavedResult) {
      setIsHistoryLoading(false);
      setHistoryError(null);
      setSavedResult(null);
      return () => {
        isMounted = false;
      };
    }

    setIsHistoryLoading(true);
    setHistoryError(null);

    const loadHistory = async () => {
      try {
        const row = historyIdParam
          ? await getRecommendationHistoryById(supabase, historyIdParam)
          : await getLatestRecommendationHistory(supabase);

        if (!isMounted) {
          return;
        }

        setSavedResult(row ? mapHistoryRowToUiModel(row) : null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat memuat rekomendasi.';
        setHistoryError(message);
        setSavedResult(null);
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [historyIdParam, isViewingSavedResult]);

  useEffect(() => {
    if (!parsedPayload || historyIdParam || !rawPayload) {
      return;
    }

    if (savedPayloadRef.current === rawPayload) {
      return;
    }

    savedPayloadRef.current = rawPayload;

    const persistHistory = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        return;
      }

      const insertPayload = mapResultToHistoryInsertPayload(parsedPayload, usedQueryParam);
      const { error: insertError } = await supabase
        .from('recommendation_history')
        .insert({
          user_id: data.user.id,
          ...insertPayload,
        })
        .select()
        .single();

      if (insertError) {
        console.warn('Failed to insert recommendation history', insertError);
      }
    };

    void persistHistory();
  }, [historyIdParam, parsedPayload, rawPayload, usedQueryParam]);

  const recommendations = useMemo(() => {
    const recs = displayedResult?.answer?.recommendations ?? [];
    return [...recs].sort((a, b) => a.rank - b.rank).slice(0, 6);
  }, [displayedResult]);

  return (
    <SafeAreaView className="flex-1 bg-[#F3F7F0]">
      <View className="flex-1 px-6 pt-8 pb-4">
        {isViewingSavedResult ? (
          <View className="mb-4 flex-row items-center justify-between">
            <TouchableOpacity
              className="h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white"
              activeOpacity={0.8}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
            >
              <FontAwesome6 name="chevron-left" size={18} color="#1A770A" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-xl font-montserrat-bold text-[#0F2E04]">
              Hasil Rekomendasi
            </Text>
            <View className="h-11 w-11" />
          </View>
        ) : null}
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
          {isViewingSavedResult && isHistoryLoading ? (
            <View className="items-center justify-center rounded-3xl bg-white p-6 shadow-sm shadow-black/5">
              <ActivityIndicator size="large" color="#1A770A" />
              <Text className="mt-3 font-montserrat text-sm text-[#6B7280]">
                Memuat riwayat rekomendasi...
              </Text>
            </View>
          ) : historyError ? (
            <View className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
              <Text className="mb-1 font-montserrat-bold text-sm text-[#0F2E04]">
                Gagal Memuat
              </Text>
              <Text className="font-montserrat text-sm text-[#6B7280]">{historyError}</Text>
            </View>
          ) : displayedResult ? (
            <>
              {displayedResult.answer?.summary ? (
                <View className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
                  <Text className="mb-1 font-montserrat-bold text-sm text-[#0F2E04]">Ringkasan</Text>
                  <Text className="font-montserrat text-sm text-[#374151]">
                    {displayedResult.answer.summary}
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
          ) : isViewingSavedResult ? (
            <Text className="font-montserrat text-sm text-[#6B7280]">
              Belum ada rekomendasi tersimpan. Silakan lakukan pencarian terlebih dahulu.
            </Text>
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
