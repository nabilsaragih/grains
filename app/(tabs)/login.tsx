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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FooterWave from '@/components/FooterWave';
import FeedbackModal from '@/components/FeedbackModal';
import loginStyles from '@/styles/loginStyles';
import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';
import { isStrongPassword, isValidEmail } from '@/utils/validators';
import { useAuth } from '@/contexts/AuthContext';

function getFriendlyAuthError(message?: string) {
  if (!message) {
    return 'Terjadi kesalahan saat login.';
  }

  if (/invalid login credentials/i.test(message)) {
    return 'Email atau password salah.';
  }

  if (/invalid api key/i.test(message)) {
    return 'Email atau password salah atau akun belum terdaftar.';
  }

  if (/email not confirmed/i.test(message)) {
    return 'Silakan verifikasi email Anda sebelum login.';
  }

  return message;
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const keyboardOffset = useKeyboardOffset();
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;
  const isFeedbackVisible = useMemo(() => Boolean(feedbackMessage), [feedbackMessage]);
  const footerOffsetStyle = useMemo(() => (keyboardOffset ? { bottom: -keyboardOffset } : undefined), [keyboardOffset]);

  const resetState = useCallback(() => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setIsSubmitting(false);
    setFeedbackMessage(null);
  }, []);

  const handleBack = useCallback(() => {
    if (user) {
      router.replace('/(tabs)/manual');
    } else {
      router.replace('/');
    }
  }, [router, user]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)/manual?entry=login');
    }
  }, [isLoading, router, user]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetState();
      };
    }, [resetState]),
  );

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      showFeedback('Harap lengkapi email dan password Anda.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      showFeedback('Format email tidak valid.');
      return;
    }

    if (!isStrongPassword(normalizedPassword)) {
      showFeedback('Password minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.');
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn({ email: normalizedEmail, password: normalizedPassword });
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : undefined;
      const friendlyMessage = getFriendlyAuthError(rawMessage);
      showFeedback(friendlyMessage);
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
            <View className="flex-none pt-16 px-8 py-4">
              <TouchableOpacity onPress={handleBack}>
                <MaterialIcons name="keyboard-backspace" size={36} color="black" />
              </TouchableOpacity>
            </View>

            <View className="flex-1 px-8">
              <Text className="mt-6 text-center text-2xl font-montserrat-bold">Selamat Datang!</Text>

              <View className="mt-8 mb-6">
                <Text className="mb-2 px-5 font-montserrat-bold">Email</Text>
                <TextInput
                  className="border border-black rounded-3xl px-5 font-montserrat"
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
                <View className="flex-row items-center border border-black rounded-3xl px-5">
                  <TextInput
                    className="flex-1 py-3 font-montserrat"
                    style={loginStyles.inputText}
                    placeholder="Masukkan password anda"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} className="pl-3">
                    <FontAwesome6
                      name={showPassword ? 'eye-slash' : 'eye'}
                      size={20}
                      color={showPassword ? '#1A770A' : '#111111'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="w-full mb-2">
                <TouchableOpacity
                  className={`bg-[#1A770A] w-full items-center rounded-3xl py-3 shadow-md active:opacity-80 ${
                    isSubmitting || isLoading ? 'opacity-70' : ''
                  }`}
                  onPress={handleLogin}
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-lg font-montserrat-bold text-white">Login</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View className="mb-6 mt-2 flex-row justify-center">
                <Text className="mr-1 text-sm font-montserrat-bold text-black">Belum punya akun?</Text>
                <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/signup')}>
                  <Text className="text-sm font-montserrat-bold text-[#2A730B] underline underline-offset-4">Daftar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        <FooterWave style={[loginStyles.footerWave, footerOffsetStyle]} />
      </View>

      {isFeedbackVisible && feedbackMessage && (
        <FeedbackModal message={feedbackMessage} onClose={() => setFeedbackMessage(null)} />
      )}
    </SafeAreaView>
  );
}






