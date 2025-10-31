'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FooterNav from '@/components/FooterNav';
import AppModal from '@/components/AppModal';

interface NutritionRow {
  id: number;
  label: string;
  value: string;
}

const UNIT_OPTIONS = ['g', 'mL', 'pcs'];
// Endpoint for manual form submission (configure via EXPO_PUBLIC_MANUAL_SEARCH_URL env var).
const MANUAL_SEARCH_API_URL = process.env.EXPO_PUBLIC_MANUAL_SEARCH_URL;
const headerMinHeightStyle = { minHeight: 88 };
const titleLineHeightStyle = { lineHeight: 26 };
const scrollContentPaddingStyle = { paddingBottom: 160 };
const cardShadowStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

const inputBaseClass =
  'border border-[#D6E4D6] rounded-[18px] px-4 py-2.5 font-montserrat text-sm text-[#111111] bg-[#FAFCF8]';
export default function ManualScreen() {
  const [searchText, setSearchText] = useState('');
  const [productName, setProductName] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [portionUnitIndex, setPortionUnitIndex] = useState(0);
  const [nutritionRows, setNutritionRows] = useState<NutritionRow[]>([
    { id: Date.now(), label: '', value: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });

  const portionUnit = useMemo(
    () => UNIT_OPTIONS[portionUnitIndex % UNIT_OPTIONS.length],
    [portionUnitIndex],
  );

  const addNutritionRow = () => {
    setNutritionRows((prev) => [...prev, { id: Date.now(), label: '', value: '' }]);
  };

  const updateRow = (id: number, key: 'label' | 'value', nextValue: string) => {
    setNutritionRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: nextValue } : row)),
    );
  };

  const removeRow = (id: number) => {
    setNutritionRows((prev) =>
      prev.length > 1 ? prev.filter((row) => row.id !== id) : prev,
    );
  };

  const cyclePortionUnit = () => {
    setPortionUnitIndex((prev) => prev + 1);
  };

  const showModal = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    setModalState({ visible: true, title, message, type });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleManualSubmit = useCallback(async () => {
    if (!MANUAL_SEARCH_API_URL) {
      showModal(
        'error',
        'Konfigurasi Tidak Lengkap',
        'Harap set EXPO_PUBLIC_MANUAL_SEARCH_URL sebelum mengirim data manual.',
      );
      return;
    }

    if (isSubmitting) {
      return;
    }

    const trimmedProductName = productName.trim();
    const trimmedSearchQuery = searchText.trim();
    const trimmedPortionSize = portionSize.trim();
    const portionSizeNumber = trimmedPortionSize ? Number(trimmedPortionSize) : null;
    const normalizedPortionSize =
      portionSizeNumber !== null && !Number.isNaN(portionSizeNumber)
        ? portionSizeNumber
        : null;

    const normalizedNutrition = nutritionRows
      .map((row) => ({
        label: row.label.trim(),
        value: row.value.trim(),
      }))
      .filter((row) => row.label && row.value);

    const payload = {
      query: trimmedSearchQuery,
      product: {
        name: trimmedProductName || null,
        portion: {
          size: normalizedPortionSize,
          unit: portionUnit,
        },
      },
      nutritionFacts: normalizedNutrition,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(MANUAL_SEARCH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Permintaan manual gagal diproses.');
      }

      let responseBody: unknown = null;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      console.log('Manual form submission result:', responseBody);
      showModal('success', 'Berhasil', 'Data manual berhasil dikirim.');
    } catch (error) {
      console.warn('Failed to submit manual form', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat mengirim data manual.';
      showModal('error', 'Gagal Mengirim', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, nutritionRows, portionUnit, portionSize, productName, searchText, showModal]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        className="flex-1"
        colors={['#E4F4E4', '#F9FDF9']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <View className="flex-1">
          <View className="flex-row items-center justify-center pt-6 pb-4" style={headerMinHeightStyle}>
            <Text className="text-center text-xl font-montserrat-bold text-[#0F2E04]" style={titleLineHeightStyle}>
              Masukkan Informasi Produk
            </Text>
          </View>

          <ScrollView
            contentContainerClassName="px-6"
            contentContainerStyle={scrollContentPaddingStyle}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="mb-6 flex-row items-stretch gap-3">
              <View className="h-12 flex-1 flex-row items-center rounded-[20px] border border-[#D6E4D6] bg-[#F5F7F4] px-2">
                <TextInput
                  className="h-full flex-1 font-montserrat text-sm text-[#111111]"
                  placeholder="Temukan alternatif yang lebih sehat"
                  placeholderTextColor="#9CA3AF"
                  value={searchText}
                  onChangeText={setSearchText}
                  returnKeyType="search"
                  textAlignVertical="center"
                  style={{ paddingVertical: 0 }}
                />
              </View>
              <TouchableOpacity
                className="h-12 flex-row items-center justify-center gap-2 rounded-[20px] bg-[#1A770A] px-5"
                activeOpacity={0.9}
                onPress={handleManualSubmit}
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.8 : 1 }}
              >
                {isSubmitting ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text className="font-montserrat-bold text-sm text-white">Memproses...</Text>
                  </>
                ) : (
                  <>
                    <FontAwesome6 name="magnifying-glass" size={14} color="#FFFFFF" />
                    <Text className="font-montserrat-bold text-sm text-white">Cari</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View className="gap-5 rounded-3xl bg-white py-4 px-[18px]" style={cardShadowStyle}>
              <View className="gap-2">
                <Text className="font-montserrat-bold text-sm text-[#111111]">Nama Produk</Text>
                <TextInput
                  className={inputBaseClass}
                  placeholder="Nama Produk"
                  placeholderTextColor="#9CA3AF"
                  value={productName}
                  onChangeText={setProductName}
                />
              </View>

              <View className="gap-2">
                <Text className="font-montserrat-bold text-sm text-[#111111]">Ukuran Sajian</Text>
                <View className="flex-row items-center gap-3">
                  <TextInput
                    className={`${inputBaseClass} flex-1`}
                    placeholder="Jumlah Per Sajian"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={portionSize}
                    onChangeText={setPortionSize}
                  />
                  <TouchableOpacity
                    activeOpacity={0.9}
                    className="min-w-[56px] items-center justify-center rounded-2xl bg-[#1A770A] py-2 px-3"
                    onPress={cyclePortionUnit}
                  >
                    <Text className="font-montserrat-bold text-[13px] text-white">{portionUnit}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text className="mt-8 mb-3 font-montserrat-bold text-base text-[#0F2E04]">
              Informasi Nutrisi per Sajian:
            </Text>

            <View className="gap-3 rounded-3xl bg-white p-3" style={cardShadowStyle}>
              {nutritionRows.map((row, index) => (
                <View
                  key={row.id}
                  className={`flex-row items-center gap-2.5 border-b border-[#E6F1E6] pb-2.5 ${
                    index === nutritionRows.length - 1 ? 'border-b-0 pb-0' : ''
                  }`}
                >
                  <TextInput
                    className={`${inputBaseClass} flex-1`}
                    placeholder="Kalori"
                    placeholderTextColor="#9CA3AF"
                    value={row.label}
                    onChangeText={(value) => updateRow(row.id, 'label', value)}
                  />
                  <TextInput
                    className={`${inputBaseClass} flex-1`}
                    placeholder="kcal"
                    placeholderTextColor="#9CA3AF"
                    value={row.value}
                    onChangeText={(value) => updateRow(row.id, 'value', value)}
                  />
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => removeRow(row.id)}
                    disabled={nutritionRows.length === 1}
                    activeOpacity={0.85}
                  >
                    <FontAwesome6
                      name="trash"
                      size={16}
                      color={nutritionRows.length === 1 ? '#C7CED4' : '#B91C1C'}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              className="mt-5 flex-row items-center justify-center gap-2.5 rounded-3xl bg-[#1A770A] py-3"
              onPress={addNutritionRow}
              activeOpacity={0.9}
            >
              <FontAwesome6 name="plus" size={16} color="#fff" />
              <Text className="font-montserrat-bold text-[15px] text-white">
                Tambahkan lebih banyak nutrisi
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <FooterNav />
      </LinearGradient>
      <AppModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}
