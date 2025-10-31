'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import type { User } from '@supabase/supabase-js';
import FooterNav from '@/components/FooterNav';
import AppModal from '@/components/AppModal';
import { supabase } from '@/lib/supabase';
import { useAvatarPicker } from '@/hooks/useAvatarPicker';

type FormState = {
  avatarUrl: string;
  fullName: string;
  birthDate: string;
  gender: string;
  weight: string;
  height: string;
  medicalHistory: string;
};

type MetadataSnapshot = FormState;

const DEFAULT_FORM_STATE: FormState = {
  avatarUrl: '',
  fullName: '',
  birthDate: '',
  gender: '',
  weight: '',
  height: '',
  medicalHistory: '',
};

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'] as const;
const MAX_MEDICAL_HISTORY_LENGTH = 600;

function parseOptionalPositiveNumber(value: string, label: string) {
  const trimmed = value.trim().replace(',', '.');

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`${label} harus berupa angka positif.`);
  }

  return parsed;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { pickAvatar } = useAvatarPicker();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
  const [initialSnapshot, setInitialSnapshot] = useState<MetadataSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    onClose?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showModal = useCallback(
    (config: { title: string; message: string; type?: 'success' | 'error' | 'info'; onClose?: () => void }) => {
      setModalConfig({
        visible: true,
        title: config.title,
        message: config.message,
        type: config.type ?? 'info',
        onClose: config.onClose,
      });
    },
    [],
  );

  const closeModal = useCallback(() => {
    setModalConfig((prev) => {
      prev.onClose?.();
      return {
        visible: false,
        title: '',
        message: '',
        type: prev.type,
        onClose: undefined,
      };
    });
  }, []);

  const populateForm = useCallback((user: User) => {
    const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
    const snapshot: MetadataSnapshot = {
      avatarUrl: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : '',
      fullName: typeof metadata.full_name === 'string' ? metadata.full_name : '',
      birthDate: typeof metadata.birth_date === 'string' ? metadata.birth_date : '',
      gender: typeof metadata.gender === 'string' ? metadata.gender : '',
      weight:
        typeof metadata.weight === 'number' || typeof metadata.weight === 'string'
          ? String(metadata.weight)
          : '',
      height:
        typeof metadata.height === 'number' || typeof metadata.height === 'string'
          ? String(metadata.height)
          : '',
      medicalHistory:
        typeof metadata.medical_history === 'string' ? metadata.medical_history : '',
    };

    setInitialSnapshot(snapshot);
    setForm((prev) => ({
      ...prev,
      ...snapshot,
    }));
  }, []);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        throw new Error(error?.message ?? 'Tidak dapat memuat data pengguna.');
      }

      populateForm(data.user);
    } catch (error) {
      console.warn('Failed to fetch edit profile data', error);
      showModal({
        title: 'Gagal Memuat Profil',
        message:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat memuat profil. Silakan coba lagi.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [populateForm, showModal]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const handleChange = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectAvatar = useCallback(async () => {
    try {
      const result = await pickAvatar();

      if (!result) {
        return;
      }

      handleChange('avatarUrl', result);
    } catch (error) {
      console.warn('Failed to pick avatar', error);
      showModal({
        title: 'Gagal Memilih Foto',
        message:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat membuka galeri. Silakan coba lagi.',
        type: 'error',
      });
    }
  }, [handleChange, pickAvatar, showModal]);

  const handleDateChange = useCallback(
    (_event: any, date?: Date) => {
      if (Platform.OS === 'android') {
        setDatePickerVisible(false);
      }
      if (date) {
        handleChange('birthDate', dayjs(date).format('YYYY-MM-DD'));
      }
    },
    [handleChange],
  );

  const normalizedInitial = useMemo(() => {
    if (!initialSnapshot) {
      return null;
    }

    return {
      ...initialSnapshot,
      weight: initialSnapshot.weight?.trim() ?? '',
      height: initialSnapshot.height?.trim() ?? '',
    };
  }, [initialSnapshot]);

  const handleCancel = useCallback(() => {
    router.replace('/(app)/profile');
  }, [router]);

  const handleSave = useCallback(async () => {
    if (!normalizedInitial) {
      showModal({
        title: 'Data Belum Siap',
        message: 'Harap tunggu hingga data profil selesai dimuat.',
        type: 'info',
      });
      return;
    }

    if (isSubmitting) {
      return;
    }

    const updates: Record<string, any> = {};

    const trimmedName = form.fullName.trim();
    if (trimmedName !== (normalizedInitial.fullName ?? '')) {
      if (!trimmedName || trimmedName.length < 3) {
        showModal({
          title: 'Nama Tidak Valid',
          message: 'Nama lengkap minimal 3 karakter dan tidak boleh kosong.',
          type: 'error',
        });
        return;
      }
      updates.full_name = trimmedName;
    }

    if (form.avatarUrl !== (normalizedInitial.avatarUrl ?? '')) {
      updates.avatar_url = form.avatarUrl || null;
    }

    if ((form.birthDate || '') !== (normalizedInitial.birthDate || '')) {
      if (form.birthDate && !dayjs(form.birthDate, 'YYYY-MM-DD', true).isValid()) {
        showModal({
          title: 'Tanggal Tidak Valid',
          message: 'Format tanggal lahir harus YYYY-MM-DD.',
          type: 'error',
        });
        return;
      }
      updates.birth_date = form.birthDate || null;
    }

    if ((form.gender || '') !== (normalizedInitial.gender || '')) {
      if (form.gender && !GENDER_OPTIONS.includes(form.gender as (typeof GENDER_OPTIONS)[number])) {
        showModal({
          title: 'Jenis Kelamin Tidak Valid',
          message: 'Pilih salah satu opsi yang tersedia.',
          type: 'error',
        });
        return;
      }
      updates.gender = form.gender || null;
    }

    try {
      if ((form.weight.trim() || '') !== (normalizedInitial.weight || '')) {
        updates.weight = parseOptionalPositiveNumber(form.weight, 'Berat badan');
      }

      if ((form.height.trim() || '') !== (normalizedInitial.height || '')) {
        updates.height = parseOptionalPositiveNumber(form.height, 'Tinggi badan');
      }
    } catch (error) {
      showModal({
        title: 'Input Tidak Valid',
        message: error instanceof Error ? error.message : 'Periksa kembali nilai tinggi/berat Anda.',
        type: 'error',
      });
      return;
    }

    if ((form.medicalHistory ?? '') !== (normalizedInitial.medicalHistory ?? '')) {
      if (form.medicalHistory.length > MAX_MEDICAL_HISTORY_LENGTH) {
        showModal({
          title: 'Riwayat Terlalu Panjang',
          message: `Riwayat penyakit maksimal ${MAX_MEDICAL_HISTORY_LENGTH} karakter.`,
          type: 'error',
        });
        return;
      }
      updates.medical_history = form.medicalHistory.trim() || null;
    }

    const hasMetadataChanges = Object.keys(updates).length > 0;

    if (!hasMetadataChanges) {
      showModal({
        title: 'Tidak Ada Perubahan',
        message: 'Anda belum mengubah data apa pun.',
        type: 'info',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Parameters<typeof supabase.auth.updateUser>[0] = {};

      payload.data = updates;

      const { error } = await supabase.auth.updateUser(payload);

      if (error) {
        throw new Error(error.message);
      }

      showModal({
        title: 'Profil Diperbarui',
        message: 'Perubahan profil berhasil disimpan.',
        type: 'success',
        onClose: () => router.replace('/(app)/profile'),
      });
    } catch (error) {
      console.warn('Failed to update profile', error);
      showModal({
        title: 'Gagal Menyimpan',
        message:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat menyimpan perubahan.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, normalizedInitial, router, showModal, isSubmitting]);

  const birthDateLabel = form.birthDate ? dayjs(form.birthDate).format('DD MMMM YYYY') : 'Atur tanggal lahir';

  const genderLabel = form.gender || 'Pilih jenis kelamin';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 pt-8 pb-4">
          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB]"
            activeOpacity={0.8}
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke profil"
          >
            <FontAwesome6 name="chevron-left" size={18} color="#1A770A" />
          </TouchableOpacity>
          <Text className="text-2xl font-montserrat-bold text-[#0F2E04]">Edit Profil</Text>
          <View className="h-11 w-11" />
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#1A770A" />
            <Text className="mt-3 font-montserrat text-sm text-[#6B7280]">Memuat data profil...</Text>
          </View>
        ) : (
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -80}
          >
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 140 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="px-6">
                <View className="items-center">
                  <View className="relative">
                    {form.avatarUrl ? (
                      <Image
                        source={{ uri: form.avatarUrl }}
                        className="h-32 w-32 rounded-full bg-[#F3F4F6]"
                        accessibilityLabel="Foto profil saat ini"
                      />
                    ) : (
                      <View
                        className="h-32 w-32 items-center justify-center rounded-full bg-[#E5E7EB]"
                        accessibilityRole="image"
                        accessibilityLabel="Placeholder foto profil"
                      >
                        <FontAwesome6 name="user" size={48} color="#9CA3AF" />
                      </View>
                    )}

                    <TouchableOpacity
                      className="absolute -bottom-1 -right-1 flex-row items-center rounded-full border border-[#E5E7EB] bg-white px-2 py-2 shadow-sm"
                      activeOpacity={0.85}
                      onPress={handleSelectAvatar}
                      accessibilityRole="button"
                      accessibilityLabel="Ubah foto profil"
                    >
                      <FontAwesome6 name="camera" size={12} color="#1A770A" />
                      {/* <Text className="ml-1 text-xs font-montserrat-semibold text-[#1A770A]">
                        Ubah foto
                      </Text> */}
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mt-8 space-y-5">
                  <View className="mb-4">
                    <Text className="mb-2 pl-5 font-montserrat-bold text-[#0F2E04]">Nama Lengkap</Text>
                    <TextInput
                      className="rounded-3xl border border-black px-5 py-3 font-montserrat"
                      placeholder="Masukkan nama lengkap"
                      placeholderTextColor="#9CA3AF"
                      value={form.fullName}
                      onChangeText={(text) => handleChange('fullName', text)}
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 pl-5 font-montserrat-bold text-[#0F2E04]">Tanggal Lahir</Text>
                    <TouchableOpacity
                      className="flex-row items-center rounded-3xl border border-black px-5 py-3"
                      onPress={() => setDatePickerVisible(true)}
                      activeOpacity={0.85}
                    >
                      <Text
                        className={`flex-1 font-montserrat ${
                          form.birthDate ? 'text-black' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {birthDateLabel}
                      </Text>
                      <FontAwesome6 name="calendar-days" size={18} color="#111827" />
                    </TouchableOpacity>

                    {isDatePickerVisible && (
                      <DateTimePicker
                        mode="date"
                        display="calendar"
                        value={
                          form.birthDate && dayjs(form.birthDate, 'YYYY-MM-DD', true).isValid()
                            ? dayjs(form.birthDate).toDate()
                            : new Date()
                        }
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 pl-5 font-montserrat-bold text-[#0F2E04]">Jenis Kelamin</Text>
                    <TouchableOpacity
                      className="flex-row items-center rounded-3xl border border-black px-5 py-3"
                      onPress={() => setGenderModalVisible(true)}
                      activeOpacity={0.85}
                    >
                      <Text
                        className={`flex-1 font-montserrat ${
                          form.gender ? 'text-black' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {genderLabel}
                      </Text>
                      <FontAwesome6 name="chevron-down" size={18} color="#111827" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                      <Text className="mb-2 pl-5 font-montserrat-bold text-[#0F2E04]">Berat (kg)</Text>
                      <TextInput
                        className="rounded-3xl border border-black px-5 py-3 font-montserrat"
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="decimal-pad"
                        value={form.weight}
                        onChangeText={(text) => handleChange('weight', text)}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-2 pl-5 font-montserrat-bold text-[#0F2E04]">Tinggi (cm)</Text>
                      <TextInput
                        className="rounded-3xl border border-black px-5 py-3 font-montserrat"
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="decimal-pad"
                        value={form.height}
                        onChangeText={(text) => handleChange('height', text)}
                      />
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 pl-5 font-montserrat-bold text-[#0F2E04]">Riwayat Penyakit</Text>
                    <TextInput
                      className="rounded-3xl border border-black px-5 py-3 font-montserrat"
                      placeholder="Tulis riwayat penyakit Anda"
                      placeholderTextColor="#9CA3AF"
                      value={form.medicalHistory}
                      onChangeText={(text) => handleChange('medicalHistory', text)}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      style={{ minHeight: 120 }}
                    />
                    <Text className="mt-1 text-right text-xs font-montserrat text-[#6B7280]">
                      {form.medicalHistory.length}/{MAX_MEDICAL_HISTORY_LENGTH}
                    </Text>
                  </View>

                  <View className="mt-4 flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 items-center justify-center rounded-3xl border border-[#1A770A] py-3"
                      activeOpacity={0.85}
                      onPress={handleCancel}
                      accessibilityRole="button"
                      accessibilityLabel="Batalkan perubahan"
                      disabled={isSubmitting}
                      style={{ opacity: isSubmitting ? 0.6 : 1 }}
                    >
                      <Text className="text-base font-montserrat-bold text-[#1A770A]">Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 items-center justify-center rounded-3xl bg-[#1A770A] py-3"
                      activeOpacity={0.85}
                      onPress={handleSave}
                      accessibilityRole="button"
                      accessibilityLabel="Simpan perubahan"
                      disabled={isSubmitting}
                      style={{ opacity: isSubmitting ? 0.7 : 1 }}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-base font-montserrat-bold text-white">Simpan</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>

      <FooterNav />

      <Modal
        transparent
        animationType="fade"
        visible={isGenderModalVisible}
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 items-center justify-center bg-black/30 px-6"
          onPress={() => setGenderModalVisible(false)}
        >
          <View className="w-full overflow-hidden rounded-3xl bg-white">
            {GENDER_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={option}
                className={`px-5 py-4 ${index !== GENDER_OPTIONS.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}
                activeOpacity={0.85}
                onPress={() => {
                  handleChange('gender', option);
                  setGenderModalVisible(false);
                }}
              >
                <Text className="text-base font-montserrat">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <AppModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}
