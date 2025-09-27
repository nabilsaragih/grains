import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
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
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import signupStyles from '@/styles/signupStyles';
import FeedbackModal from '@/components/FeedbackModal';
import { isStrongPassword, isValidEmail } from '@/utils/validators';
import { useAuth } from '@/contexts/AuthContext';

const genderOptions = ['Laki-laki', 'Perempuan'];

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, user, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedGender, setSelectedGender] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const formattedDate = useMemo(() => (selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : ''), [selectedDate]);
  const isFeedbackVisible = useMemo(() => Boolean(feedbackMessage), [feedbackMessage]);
  const handleBack = useCallback(() => {
    if (user) {
      router.replace('/(tabs)/manual');
    } else {
      router.replace('/');
    }
  }, [router, user]);

  const resetState = useCallback(() => {
    setFullName('');
    setEmail('');
    setPassword('');
    setSelectedDate(null);
    setSelectedGender('');
    setMedicalHistory('');
    setHeight('');
    setWeight('');
    setShowPassword(false);
    setIsSubmitting(false);
    setDatePickerVisible(false);
    setGenderModalVisible(false);
    setFeedbackMessage(null);
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/');
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

  const handleSignup = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      showFeedback('Email dan password wajib diisi.');
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
      await signUp({
        email: normalizedEmail,
        password: normalizedPassword,
        fullName,
        birthDate: formattedDate,
        gender: selectedGender,
        medicalHistory,
        height,
        weight,
      });

      Alert.alert('Registrasi berhasil', 'Silakan cek email Anda untuk verifikasi sebelum login.', [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat registrasi.';
      showFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={signupStyles.screen}>
      <View className="flex-1 bg-white">
        <View className="absolute top-0 left-0 right-0 z-10 bg-white">
          <View className="flex-row items-center justify-between px-8 py-4 pt-16">
            <TouchableOpacity onPress={handleBack}>
              <MaterialIcons name="keyboard-backspace" size={36} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={signupStyles.scrollContent}>
          <View className="items-center">
            <Text className="mt-6 text-2xl font-montserrat-bold">Selamat Datang!</Text>

            <View className="mt-8 w-full px-8">
              <View style={signupStyles.field}>
                <Text className="mb-2 px-5 font-montserrat-bold">Nama Lengkap</Text>
                <TextInput
                  className="border border-black rounded-3xl px-5 font-montserrat"
                  style={signupStyles.inputText}
                  placeholder="Masukkan nama lengkap anda"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={signupStyles.field}>
                <Text className="mb-2 px-5 font-montserrat-bold">Email</Text>
                <TextInput
                  className="border border-black rounded-3xl px-5 font-montserrat"
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
                <View className="flex-row items-center border border-black rounded-3xl px-5">
                  <TextInput
                    className="flex-1 py-3 font-montserrat"
                    style={signupStyles.inputText}
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

              <View style={signupStyles.field}>
                <Text className="mb-2 px-5 font-montserrat-bold">Tanggal Lahir</Text>
                <TouchableOpacity
                  className="flex-row items-center border border-black rounded-3xl px-5 py-3"
                  onPress={() => setDatePickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text className={`flex-1 font-montserrat text-base ${formattedDate ? 'text-black' : 'text-gray-400'}`}>
                    {formattedDate || 'yyyy-mm-dd'}
                  </Text>
                  <FontAwesome6 name="calendar" size={20} color="black" />
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
                  className="flex-row items-center border border-black rounded-3xl px-5 py-3"
                  onPress={() => setGenderModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text className={`flex-1 font-montserrat text-base ${selectedGender ? 'text-black' : 'text-gray-400'}`}>
                    {selectedGender || 'Pilih jenis kelamin'}
                  </Text>
                  <FontAwesome6 name="chevron-down" size={20} color="black" />
                </TouchableOpacity>

                <Modal transparent animationType="fade" visible={isGenderModalVisible}>
                  <Pressable className="flex-1 items-center justify-center bg-black/30" onPress={() => setGenderModalVisible(false)}>
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
                  className="border border-black rounded-3xl px-5 font-montserrat"
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
                    className="border border-black rounded-3xl px-5 py-3 font-montserrat"
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
                    className="border border-black rounded-3xl px-5 py-3 font-montserrat"
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
                  className={`bg-[#1A770A] w-full items-center rounded-3xl py-3 shadow-md active:opacity-80 ${
                    isSubmitting || isLoading ? 'opacity-70' : ''
                  }`}
                  onPress={handleSignup}
                  disabled={isSubmitting || isLoading}
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
                  <Text className="text-sm font-montserrat-bold text-[#2A730B] underline underline-offset-4">Masuk</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {isFeedbackVisible && feedbackMessage && (
        <FeedbackModal message={feedbackMessage} onClose={() => setFeedbackMessage(null)} />
      )}
    </SafeAreaView>
  );
}


