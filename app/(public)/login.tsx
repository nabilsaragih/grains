'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FooterWave from '@/components/FooterWave';
import loginStyles from '@/styles/loginStyles';
import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';
import { useAuth } from '@/src/auth/AuthProvider';
import AppModal from '@/components/AppModal';
import PasswordInput from '@/src/components/forms/PasswordInput';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isReady } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const keyboardOffset = useKeyboardOffset();
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;
  const footerOffsetStyle = useMemo(
    () => (keyboardOffset ? { bottom: -keyboardOffset } : undefined),
    [keyboardOffset],
  );

  const resetState = useCallback(() => {
    setEmail('');
    setPassword('');
    setIsSubmitting(false);
    setErrorMessage(null);
    setModalVisible(false);
  }, []);

  const handleBack = useCallback(() => {
    router.replace('/');
  }, [router]);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/(app)/manual');
    }
  }, [isAuthenticated, isReady, router]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetState();
      };
    }, [resetState]),
  );

  const showError = (message: string) => {
    setErrorMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      showError('Harap lengkapi email dan password Anda.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(normalizedEmail, normalizedPassword);
      router.replace('/(app)/manual');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Terjadi kesalahan saat login. Silakan coba lagi.';
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={loginStyles.screen}>
      <View style={loginStyles.container}>
        <KeyboardAvoidingView
          style={loginStyles.keyboardAvoider}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <View className="flex-1 bg-white">
            <View className="flex-none px-8 py-4 pt-16">
              <TouchableOpacity onPress={handleBack}>
                <MaterialIcons name="keyboard-backspace" size={36} color="black" />
              </TouchableOpacity>
            </View>

            <View className="flex-1 px-8">
              <Text className="mt-6 text-center text-2xl font-montserrat-bold">Selamat Datang!</Text>

              <View className="mt-8 mb-6">
                <Text className="mb-2 px-5 font-montserrat-bold">Email</Text>
                <TextInput
                  className="rounded-3xl border border-black px-5 font-montserrat"
                  style={loginStyles.inputText}
                  placeholder="Masukkan email anda"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-4">
                <Text className="mb-2 px-5 font-montserrat-bold">Password</Text>
                <PasswordInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Masukkan password anda"
                  placeholderTextColor="#9CA3AF"
                  style={loginStyles.inputText}
                />
              </View>

              <View className="mb-2 w-full">
                <TouchableOpacity
                  className={`w-full items-center rounded-3xl bg-[#1A770A] py-3 shadow-md ${
                    isSubmitting ? 'opacity-70' : ''
                  }`}
                  onPress={handleLogin}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-lg font-montserrat-bold text-white">Login</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View className="mt-2 mb-6 flex-row justify-center">
                <Text className="mr-1 text-sm font-montserrat-bold text-black">Belum punya akun?</Text>
                <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/signup')}>
                  <Text className="text-sm font-montserrat-bold text-[#2A730B] underline underline-offset-4">
                    Daftar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        <FooterWave style={[loginStyles.footerWave, footerOffsetStyle]} />
      </View>

      <AppModal
        visible={isModalVisible}
        title="Login Gagal"
        message={errorMessage ?? 'Terjadi kesalahan. Silakan coba lagi.'}
        type="error"
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
