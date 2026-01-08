'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import FooterNav from '@/components/FooterNav';
import { supabase } from '@/lib/supabase';
import {
  RecommendationHistoryRow,
  RecommendationItem,
  RecommendationResult,
  mapHistoryRowToUiModel,
} from '@/lib/recommendationHistory';
import { useAuth } from '@/src/auth/AuthProvider';

const getParamValue = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

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

function HistoryCard({
  row,
  onPress,
}: {
  row: RecommendationHistoryRow;
  onPress: () => void;
}) {
  const statusLabel =
    row.is_safe === null ? 'Belum dinilai' : row.is_safe ? 'Aman' : 'Tidak aman';
  const statusColor =
    row.is_safe === null ? '#6B7280' : row.is_safe ? '#15803D' : '#B91C1C';
  const summary = row.answer_summary ?? row.assessment_summary ?? 'Tidak ada ringkasan.';

  return (
    <TouchableOpacity
      className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5"
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="mb-1 font-montserrat-bold text-sm text-[#0F2E04]" numberOfLines={2}>
            {row.used_query ?? 'Tanpa query'}
          </Text>
          <Text className="font-montserrat text-sm text-[#374151]" numberOfLines={2}>
            {summary}
          </Text>
          <View className="mt-2 flex-row items-center gap-3">
            <Text className="font-montserrat-bold text-xs" style={{ color: statusColor }}>
              {statusLabel}
            </Text>
            <Text className="font-montserrat text-xs text-[#6B7280]">
              {formatTimestamp(row.created_at)}
            </Text>
          </View>
        </View>
        <FontAwesome6 name="chevron-right" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const params = useLocalSearchParams<{
    historyId?: string | string[];
    id?: string | string[];
  }>();
  const historyIdParam = getParamValue(params.historyId) ?? getParamValue(params.id);
  const isDetailView = Boolean(historyIdParam);

  const [historyRows, setHistoryRows] = useState<RecommendationHistoryRow[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [detailRow, setDetailRow] = useState<RecommendationHistoryRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const resolveActiveUserId = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    if (userId && userId !== data.user.id) {
      throw new Error('Sesi tidak sesuai. Silakan login ulang.');
    }

    return data.user.id;
  }, [userId]);

  const loadHistoryList = useCallback(async () => {
    setListLoading(true);
    setListError(null);

    try {
      const activeUserId = await resolveActiveUserId();
      if (!activeUserId) {
        setHistoryRows([]);
        setListError('Sesi login tidak ditemukan.');
        return;
      }

      const { data, error } = await supabase
        .from('recommendation_history')
        .select('*')
        .eq('user_id', activeUserId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setHistoryRows((data ?? []) as RecommendationHistoryRow[]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat memuat riwayat rekomendasi.';
      setListError(message);
      setHistoryRows([]);
    } finally {
      setListLoading(false);
    }
  }, [resolveActiveUserId]);

  const loadDetail = useCallback(
    async (historyId: string) => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const activeUserId = await resolveActiveUserId();
        if (!activeUserId) {
          setDetailRow(null);
          setDetailError('Sesi login tidak ditemukan.');
          return;
        }

        const { data, error } = await supabase
          .from('recommendation_history')
          .select('*')
          .eq('id', historyId)
          .eq('user_id', activeUserId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setDetailRow((data ?? null) as RecommendationHistoryRow | null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat memuat detail rekomendasi.';
        setDetailError(message);
        setDetailRow(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [resolveActiveUserId],
  );

  useFocusEffect(
    useCallback(() => {
      if (isDetailView && historyIdParam) {
        void loadDetail(historyIdParam);
      } else {
        void loadHistoryList();
      }
    }, [historyIdParam, isDetailView, loadDetail, loadHistoryList]),
  );

  const detailResult = useMemo<RecommendationResult | null>(() => {
    return detailRow ? mapHistoryRowToUiModel(detailRow) : null;
  }, [detailRow]);

  const recommendations = useMemo(() => {
    const recs = detailResult?.answer?.recommendations ?? [];
    return [...recs].sort((a, b) => a.rank - b.rank).slice(0, 6);
  }, [detailResult]);

  const handleBackToList = useCallback(() => {
    router.replace('/(app)/result');
  }, [router]);

  const handleOpenDetail = useCallback(
    (id: string) => {
      router.push({ pathname: '/(app)/result', params: { historyId: id } });
    },
    [router],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F3F7F0]">
      <View className="flex-1 px-6 pt-8 pb-4">
        {isDetailView ? (
          <View className="mb-4 flex-row items-center justify-between">
            <TouchableOpacity
              className="h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white"
              activeOpacity={0.8}
              onPress={handleBackToList}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
            >
              <FontAwesome6 name="chevron-left" size={18} color="#1A770A" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-xl font-montserrat-bold text-[#0F2E04]">
              Detail Rekomendasi
            </Text>
            <View className="h-11 w-11" />
          </View>
        ) : (
          <View className="mb-4 items-center">
            <Text className="text-center text-xl font-montserrat-bold text-[#0F2E04]">
              Riwayat Rekomendasi
            </Text>
          </View>
        )}

        <View className="mb-5 rounded-3xl bg-[#13360A] p-4 shadow-lg shadow-black/10">
          <Text className="text-lg font-montserrat-bold text-white">
            {isDetailView ? 'Hasil Rekomendasi' : 'Riwayat Rekomendasi'}
          </Text>
          <Text className="mt-1 font-montserrat text-sm text-[#E6F4E6]">
            {isDetailView
              ? 'Alternatif produk yang lebih sehat berdasarkan analisis Anda.'
              : 'Pilih salah satu riwayat untuk melihat detail rekomendasi.'}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 140 }}
        >
          {isDetailView ? (
            detailLoading ? (
              <View className="items-center justify-center rounded-3xl bg-white p-6 shadow-sm shadow-black/5">
                <ActivityIndicator size="large" color="#1A770A" />
                <Text className="mt-3 font-montserrat text-sm text-[#6B7280]">
                  Memuat detail rekomendasi...
                </Text>
              </View>
            ) : detailError ? (
              <View className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
                <Text className="mb-1 font-montserrat-bold text-sm text-[#0F2E04]">
                  Gagal Memuat
                </Text>
                <Text className="font-montserrat text-sm text-[#6B7280]">{detailError}</Text>
              </View>
            ) : detailResult ? (
              <>
                {detailRow?.used_query ? (
                  <View className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
                    <Text className="mb-1 font-montserrat-bold text-sm text-[#0F2E04]">Query</Text>
                    <Text className="font-montserrat text-sm text-[#374151]">
                      {detailRow.used_query}
                    </Text>
                  </View>
                ) : null}

                {detailResult.assessment_summary ? (
                  <View className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
                    <Text className="mb-1 font-montserrat-bold text-sm text-[#0F2E04]">
                      Penilaian Produk
                    </Text>
                    <Text className="font-montserrat text-sm text-[#374151]">
                      {detailResult.assessment_summary}
                    </Text>
                    {!!detailResult.assessment_reasons?.length && (
                      <View className="mt-2 gap-1">
                        {detailResult.assessment_reasons.map((reason, idx) => (
                          <Text key={idx} className="font-montserrat text-sm text-[#374151]">
                            - {reason}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ) : null}

                {detailResult.answer?.summary ? (
                  <View className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
                    <Text className="mb-1 font-montserrat-bold text-sm text-[#0F2E04]">Ringkasan</Text>
                    <Text className="font-montserrat text-sm text-[#374151]">
                      {detailResult.answer.summary}
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
                Tidak ada data untuk ditampilkan.
              </Text>
            )
          ) : listLoading ? (
            <View className="items-center justify-center rounded-3xl bg-white p-6 shadow-sm shadow-black/5">
              <ActivityIndicator size="large" color="#1A770A" />
              <Text className="mt-3 font-montserrat text-sm text-[#6B7280]">
                Memuat riwayat rekomendasi...
              </Text>
            </View>
          ) : listError ? (
            <View className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
              <Text className="mb-1 font-montserrat-bold text-sm text-[#0F2E04]">
                Gagal Memuat
              </Text>
              <Text className="font-montserrat text-sm text-[#6B7280]">{listError}</Text>
            </View>
          ) : historyRows.length ? (
            <View className="gap-3">
              {historyRows.map((row) => (
                <HistoryCard key={row.id} row={row} onPress={() => handleOpenDetail(row.id)} />
              ))}
            </View>
          ) : (
            <Text className="font-montserrat text-sm text-[#6B7280]">
              Belum ada rekomendasi tersimpan. Silakan lakukan pencarian terlebih dahulu.
            </Text>
          )}
        </ScrollView>
      </View>
      <FooterNav />
    </SafeAreaView>
  );
}
