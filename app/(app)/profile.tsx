'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { User } from '@supabase/supabase-js';
import { FontAwesome6 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FooterNav from '@/components/FooterNav';
import { supabase } from '@/lib/supabase';
import AppModal from '@/components/AppModal';
import { useAuth } from '@/src/auth/AuthProvider';
import { useAvatarPicker } from '@/hooks/useAvatarPicker';

function formatValue(value: unknown) {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : '-';
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '-';
  }

  return String(value);
}

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { pickAvatar } = useAvatarPicker();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [modalState, setModalState] = useState({
    visible: false,
    title: '',
    message: '',
  });
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(undefined);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Tidak dapat menemukan data akun Anda.');
      }

      setUser(data.user);
      setLocalAvatar(undefined);
    } catch (error) {
      console.warn('Failed to load profile data', error);
      setModalState({
        visible: true,
        title: 'Gagal Memuat Profil',
        message:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat mengambil data profil. Silakan coba lagi.',
      });
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const metadata = useMemo<Record<string, any>>(
    () => (user?.user_metadata ?? {}) as Record<string, any>,
    [user],
  );

  const infoRows = useMemo(
    () => [
      { label: 'Email', value: user?.email ?? '-' },
      { label: 'Jenis Kelamin', value: formatValue(metadata?.gender) },
      { label: 'Riwayat Penyakit', value: formatValue(metadata?.medical_history) },
      {
        label: 'Berat (kg)',
        value:
          metadata?.weight || metadata?.weight === 0 ? `${metadata.weight} kg` : '-',
      },
      {
        label: 'Tinggi (cm)',
        value:
          metadata?.height || metadata?.height === 0 ? `${metadata.height} cm` : '-',
      },
    ],
    [metadata, user?.email],
  );

  const avatarUrl = typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : undefined;
  const displayAvatar = localAvatar ?? avatarUrl;
  const fullName = formatValue(metadata?.full_name);

  const handleEditProfile = useCallback(() => {
    router.push('/(app)/edit-profile');
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push('/(app)/settings');
  }, [router]);

  const handleChangePhoto = useCallback(async () => {
    try {
      const result = await pickAvatar();
      if (!result) {
        return;
      }
      setLocalAvatar(result);
    } catch (error) {
      console.warn('Failed to change avatar', error);
      setModalState({
        visible: true,
        title: 'Gagal Memilih Foto',
        message:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat membuka galeri. Silakan coba lagi.',
      });
    }
  }, [pickAvatar, setModalState]);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/');
      setLogoutModalVisible(false);
    } catch (error) {
      console.warn('Failed to logout', error);
      setModalState({
        visible: true,
        title: 'Logout Gagal',
        message:
          error instanceof Error
            ? error.message
            : 'Terjadi kendala saat keluar dari akun. Silakan coba lagi.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, router]);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-8 pb-4">
        <View className="mb-8 flex-row items-center justify-between">
          <TouchableOpacity
            className="h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-white"
            activeOpacity={0.8}
            onPress={handleEditProfile}
            accessibilityRole="button"
            accessibilityLabel="Edit profil"
          >
            <FontAwesome6 name="pen" size={16} color="#1A770A" />
          </TouchableOpacity>
          <Text className="text-3xl font-montserrat-bold text-[#0F2E04]">Profil</Text>
          <TouchableOpacity
            className="h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-white"
            activeOpacity={0.8}
            onPress={handleSettings}
            accessibilityRole="button"
            accessibilityLabel="Pengaturan"
          >
            <FontAwesome6 name="gear" size={18} color="#1A770A" />
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#1A770A" />
              <Text className="mt-3 font-montserrat text-sm text-[#6B7280]">
                Memuat data profil...
              </Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
            >
              <View className="items-center">
                <View className="relative">
                  {displayAvatar ? (
                    <Image
                      source={{ uri: displayAvatar }}
                      className="h-32 w-32 rounded-full bg-[#F3F4F6]"
                      accessibilityLabel="Foto profil pengguna"
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
                    onPress={handleChangePhoto}
                    accessibilityRole="button"
                    accessibilityLabel="Ubah foto profil"
                  >
                    <FontAwesome6 name="camera" size={12} color="#1A770A" />
                    {/* <Text className="ml-1 text-xs font-montserrat-semibold text-[#1A770A]">
                      Ubah foto
                    </Text> */}
                  </TouchableOpacity>
                </View>
                <Text className="mt-5 text-xl font-montserrat-bold text-[#0F2E04]">{fullName}</Text>
              </View>

              <View className="mt-8 rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
                {infoRows.map((row, index) => (
                  <View
                    key={row.label}
                    className={`flex-row items-start px-6 py-4 ${
                      index !== infoRows.length - 1 ? 'border-b border-[#F3F4F6]' : ''
                    }`}
                  >
                    <Text className="w-32 font-montserrat text-sm text-[#6B7280]">{row.label}</Text>
                    <Text className="pl-4 flex-1 font-montserrat-semibold text-sm text-[#111827]">
                      {row.value}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="mt-10">
                <TouchableOpacity
                  className="items-center rounded-3xl border border-[#B91C1C] bg-[#B91C1C] py-3"
                  activeOpacity={0.85}
                  onPress={() => setLogoutModalVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Logout"
                >
                  <Text className="text-lg font-montserrat-bold text-white">Logout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
      <FooterNav />
      <AppModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        onClose={closeModal}
        type="error"
      />
      <Modal
        visible={isLogoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-3xl bg-white p-6">
            <Text className="text-lg font-montserrat-bold text-[#0F2E04]">Konfirmasi Logout</Text>
            <Text className="mt-2 font-montserrat text-sm text-[#4B5563]">
              Anda yakin ingin keluar dari akun ini?
            </Text>

            <View className="mt-6 flex-row gap-4">
              <TouchableOpacity
                className="flex-1 items-center rounded-3xl border border-[#E5E7EB] py-3"
                activeOpacity={0.85}
                onPress={() => setLogoutModalVisible(false)}
                disabled={isLoggingOut}
                style={{ opacity: isLoggingOut ? 0.6 : 1 }}
              >
                <Text className="font-montserrat-semibold text-base text-[#111827]">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center rounded-3xl border border-[#B91C1C] bg-[#B91C1C] py-3"
                activeOpacity={0.85}
                onPress={handleLogout}
                disabled={isLoggingOut}
                style={{ opacity: isLoggingOut ? 0.8 : 1 }}
              >
                <Text className="font-montserrat-bold text-base text-white">
                  {isLoggingOut ? 'Memproses...' : 'Ya, Logout'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
