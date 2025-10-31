'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import signupStyles from '@/styles/signupStyles';
import { isStrongPassword, isValidEmail } from '@/utils/validators';
import { supabase } from '@/lib/supabase';
import AppModal from '@/components/AppModal';
import PasswordInput from '@/src/components/forms/PasswordInput';

const genderOptions = ['Laki-laki', 'Perempuan'];

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedGender, setSelectedGender] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    type: 'error',
  });

  const formattedDate = useMemo(
    () => (selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : ''),
    [selectedDate],
  );

  const resetState = useCallback(() => {
    setFullName('');
    setEmail('');
    setPassword('');
    setSelectedDate(null);
    setSelectedGender('');
    setMedicalHistory('');
    setHeight('');
    setWeight('');
    setDatePickerVisible(false);
    setGenderModalVisible(false);
    setIsSubmitting(false);
    setModalConfig({
      visible: false,
      title: '',
      message: '',
      type: 'error',
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetState();
      };
    }, [resetState]),
  );

  const showModal = useCallback(
    ({ title, message, type, onClose }: { title: string; message: string; type: 'success' | 'error' | 'info'; onClose?: () => void }) => {
      setModalConfig({
        visible: true,
        title,
        message,
        type,
        onClose,
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

  const showError = (message: string) => {
    showModal({
      title: 'Registrasi Gagal',
      message,
      type: 'error',
    });
  };

  const handleSignup = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      showError('Email dan password wajib diisi.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      showError('Format email tidak valid.');
      return;
    }

    if (!isStrongPassword(normalizedPassword)) {
      showError('Password minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: normalizedPassword,
        options: {
          data: {
            full_name: fullName || undefined,
            birth_date: formattedDate || undefined,
            gender: selectedGender || undefined,
            medical_history: medicalHistory || undefined,
            height: height || undefined,
            weight: weight || undefined,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      showModal({
        title: 'Registrasi Berhasil',
        message: 'Silakan cek email Anda untuk verifikasi sebelum login.',
        type: 'success',
        onClose: () => router.replace('/login'),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registrasi gagal. Silakan coba lagi.';
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={signupStyles.screen}>
      <View className="flex-1 bg-white">
        <ScrollView contentContainerStyle={signupStyles.scrollContent}>
          <View className="flex-1 bg-white">
            <View className="flex-none px-8 py-4 pt-12">
              <TouchableOpacity onPress={() => router.replace('/')}>
                <MaterialIcons name="keyboard-backspace" size={36} color="black" />
              </TouchableOpacity>
            </View>

            <View className="flex-1 px-8">
              <Text className="mb-6 text-center text-2xl font-montserrat-bold">
                Daftar Akun Baru
              </Text>

              <View style={signupStyles.field}>
                <Text className="mb-2 px-5 font-montserrat-bold">Nama Lengkap</Text>
                <TextInput
                  className="rounded-3xl border border-black px-5 font-montserrat"
                  style={signupStyles.inputText}
                  placeholder="Masukkan nama anda"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={signupStyles.field}>
                <Text className="mb-2 px-5 font-montserrat-bold">Email</Text>
                <TextInput
                  className="rounded-3xl border border-black px-5 font-montserrat"
                  style={signupStyles.inputText}
                  placeholder="Masukkan email anda"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={signupStyles.field}>
                <Text className="mb-2 px-5 font-montserrat-bold">Password</Text>
                <PasswordInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Masukkan password anda"
                  placeholderTextColor="#9CA3AF"
                  style={signupStyles.inputText}
                />
              </View>

              <View style={signupStyles.field}>
                <Text className="mb-2 px-5 font-montserrat-bold">Tanggal Lahir</Text>
                <TouchableOpacity
                  className="flex-row items-center rounded-3xl border border-black px-5 py-3"
                  onPress={() => setDatePickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`flex-1 font-montserrat text-base ${
                      formattedDate ? 'text-black' : 'text-gray-400'
                    }`}
                  >
                    {formattedDate || 'Pilih tanggal lahir'}
                  </Text>
                  <FontAwesome6 name="calendar-days" size={20} color="black" />
                </TouchableOpacity>

                {isDatePickerVisible && (
                  <DateTimePicker
                    mode="date"
                    display="calendar"
                    value={selectedDate || new Date()}
                    onChange={(event, date) => {
                      setDatePickerVisible(false);
                      if (event.type !== 'dismissed' && date) {
                        setSelectedDate(date);
                      }
                    }}
                  />
                )}
              </View>

              <View style={signupStyles.field}>
                <Text className="mb-2 px-5 font-montserrat-bold">Jenis Kelamin</Text>
                <TouchableOpacity
                  className="flex-row items-center rounded-3xl border border-black px-5 py-3"
                  onPress={() => setGenderModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`flex-1 font-montserrat text-base ${
                      selectedGender ? 'text-black' : 'text-gray-400'
                    }`}
                  >
                    {selectedGender || 'Pilih jenis kelamin'}
                  </Text>
                  <FontAwesome6 name="chevron-down" size={20} color="black" />
                </TouchableOpacity>

                <Modal transparent animationType="fade" visible={isGenderModalVisible}>
                  <Pressable
                    className="flex-1 items-center justify-center bg-black/30"
                    onPress={() => setGenderModalVisible(false)}
                  >
                    <View className="w-3/4 overflow-hidden rounded-xl bg-white">
                      {genderOptions.map((item) => (
                        <Pressable
                          key={item}
                          className="border-b border-gray-200 px-5 py-4"
                          onPress={() => {
                            setSelectedGender(item);
                            setGenderModalVisible(false);
                          }}
                        >
                          <Text className="text-lg font-montserrat">{item}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </Pressable>
                </Modal>
              </View>

              <View style={signupStyles.field}>
                <Text className="mb-2 px-5 font-montserrat-bold">Riwayat Penyakit</Text>
                <TextInput
                  className="rounded-3xl border border-black px-5 font-montserrat"
                  style={signupStyles.inputText}
                  placeholder="Masukkan riwayat penyakit anda"
                  placeholderTextColor="#9CA3AF"
                  value={medicalHistory}
                  onChangeText={setMedicalHistory}
                />
              </View>

              <View className="mb-6 flex-row justify-between">
                <View className="mr-2 flex-1">
                  <Text className="mb-2 px-5 font-montserrat-bold">Tinggi Badan</Text>
                  <TextInput
                    className="rounded-3xl border border-black px-5 py-3 font-montserrat"
                    style={signupStyles.inputText}
                    placeholder="cm"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                  />
                </View>
                <View className="ml-2 flex-1">
                  <Text className="mb-2 px-5 font-montserrat-bold">Berat Badan</Text>
                  <TextInput
                    className="rounded-3xl border border-black px-5 py-3 font-montserrat"
                    style={signupStyles.inputText}
                    placeholder="kg"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
              </View>

              <View className="mb-2 w-full">
                <TouchableOpacity
                  className={`w-full items-center rounded-3xl bg-[#1A770A] py-3 shadow-md ${
                    isSubmitting ? 'opacity-70' : ''
                  }`}
                  onPress={handleSignup}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-lg font-montserrat-bold text-white">Daftar</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View className="w-full flex-row justify-center">
                <Text className="mr-1 text-sm font-montserrat-bold text-black">Sudah punya akun?</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                  onPress={() => router.push('/login')}
                >
                  <Text className="text-sm font-montserrat-bold text-[#2A730B] underline underline-offset-4">
                    Masuk
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

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
