'use client';

import { ReactNode } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

type AppModalType = 'error' | 'success' | 'info';

interface AppModalProps {
  visible: boolean;
  title: string;
  message: string | ReactNode;
  onClose: () => void;
  type?: AppModalType;
}

const typeColors: Record<AppModalType, { icon: string; background: string; accent: string }> = {
  error: {
    icon: '⚠️',
    background: '#FEE2E2',
    accent: '#B91C1C',
  },
  success: {
    icon: '✅',
    background: '#DCFCE7',
    accent: '#15803D',
  },
  info: {
    icon: 'ℹ️',
    background: '#DBEAFE',
    accent: '#1D4ED8',
  },
};

export default function AppModal({ visible, title, message, onClose, type = 'info' }: AppModalProps) {
  const { icon, background, accent } = typeColors[type];
  const displayMessage =
    typeof message === 'string' ? translateMessage(message) : message;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full rounded-3xl bg-white p-6 shadow-lg">
          <View className="mb-4 flex-row items-center gap-2">
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: background }}
            >
              <Text className="text-xl">{icon}</Text>
            </View>
            <Text className="flex-1 text-lg font-montserrat-bold" style={{ color: accent }}>
              {title}
            </Text>
          </View>

          {typeof displayMessage === 'string' ? (
            <Text className="mb-6 font-montserrat text-base text-[#111111]">{displayMessage}</Text>
          ) : (
            <View className="mb-6">{displayMessage}</View>
          )}

          <TouchableOpacity
            className="items-center rounded-2xl bg-[#1A770A] py-3"
            activeOpacity={0.85}
            onPress={onClose}
          >
            <Text className="text-base font-montserrat-bold text-white">Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function translateMessage(message: string): string {
  const normalized = message.trim().toLowerCase().replace(/[.!?]+$/, '');

  const translations: Array<{ pattern: string; output: string }> = [
    { pattern: 'invalid login credentials', output: 'Email atau kata sandi salah.' },
    { pattern: 'network request failed', output: 'Koneksi jaringan gagal, coba lagi.' },
    {
      pattern: 'password must be at least 8 characters',
      output: 'Kata sandi harus memiliki minimal 8 karakter.',
    },
    { pattern: 'user not found', output: 'Pengguna tidak ditemukan.' },
    { pattern: 'something went wrong', output: 'Terjadi kesalahan, silakan coba lagi.' },
  ];

  const matched = translations.find(({ pattern }) => normalized.includes(pattern));

  return matched ? matched.output : message;
}
