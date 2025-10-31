'use client';

import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FooterNav from '@/components/FooterNav';
import PasswordInput from '@/src/components/forms/PasswordInput';
import { supabase } from '@/lib/supabase';
import AppModal from '@/components/AppModal';
import { validatePasswordChange } from '@/utils/validators';

export default function SecurityScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
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
      return { ...prev, visible: false, onClose: undefined };
    });
  }, []);

  const handleUpdatePassword = useCallback(async () => {
    const { isValid, errorTitle, errorMessage, password } = validatePasswordChange(
      newPassword,
      confirmPassword,
    );

    if (!isValid || !password) {
      showModal({
        title: errorTitle ?? 'Password Tidak Valid',
        message: errorMessage ?? 'Periksa kembali password baru Anda.',
        type: 'error',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw new Error(error.message);
      }

      setNewPassword('');
      setConfirmPassword('');
      showModal({
        title: 'Password Diperbarui',
        message: 'Password Anda berhasil diperbarui.',
        type: 'success',
        onClose: () => router.back(),
      });
    } catch (error) {
      showModal({
        title: 'Gagal Memperbarui',
        message:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat memperbarui password.',
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [confirmPassword, newPassword, router, showModal]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        <View className="mb-6 flex-row items-center justify-between">
          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB]"
            activeOpacity={0.8}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <FontAwesome6 name="chevron-left" size={18} color="#1A770A" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-2xl font-montserrat-bold text-[#0F2E04]">
            Keamanan Akun
          </Text>
          <View className="h-11 w-11" />
        </View>

        <View className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <Text className="text-lg font-montserrat-bold text-[#0F2E04]">Ubah Password</Text>
          <Text className="mt-2 font-montserrat text-sm text-[#4B5563]">
            Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal.
          </Text>

          <View className="mt-5 space-y-4">
            <View className='mb-4'>
              <Text className="mb-2 font-montserrat-bold text-[#0F2E04]">Password Baru</Text>
              <PasswordInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Masukkan password baru"
                containerClassName="border-black"
              />
            </View>

            <View className='mb-4'>
              <Text className="mb-2 font-montserrat-bold text-[#0F2E04]">Konfirmasi Password</Text>
              <PasswordInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Konfirmasi password baru"
                containerClassName="border-black"
              />
            </View>

            <TouchableOpacity
              className="items-center justify-center rounded-3xl bg-[#1A770A] py-3"
              activeOpacity={0.85}
              onPress={handleUpdatePassword}
              disabled={isUpdating}
              style={{ opacity: isUpdating ? 0.7 : 1 }}
              accessibilityRole="button"
              accessibilityLabel="Simpan password baru"
            >
              {isUpdating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-montserrat-bold text-white">Simpan Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FooterNav />

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
