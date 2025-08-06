import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, Pressable, ScrollView } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Link } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from "dayjs";

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const formattedDate = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : '';
  const [selectedGender, setSelectedGender] = useState('');

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);


  const options = ['Laki-laki', 'Perempuan'];

  return (
    <View className="flex-1 bg-white">
      {/* Sticky Header */}
      <View className="absolute top-0 left-0 right-0 z-10 bg-white">
        <View className="flex-row items-center justify-between px-8 py-4 pt-16">
          <Link href="/" asChild>
            <TouchableOpacity>
              <MaterialCommunityIcons name="keyboard-backspace" size={36} color="black" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Scrollable Form */}
      <ScrollView contentContainerStyle={{ paddingBottom: 50, paddingTop: 100 }}>
        <View className="items-center">
          <Text className="text-2xl font-montserrat-bold mt-6">Selamat Datang!</Text>

          <View className="w-full px-8 mt-8">
            {/* Email */}
            <View className="mb-6">
              <Text className="mb-2 px-5 font-montserrat-bold">Email</Text>
              <TextInput
                className="border border-black rounded-3xl px-5 font-montserrat"
                placeholder="Masukkan email anda"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View className="mb-6">
              <Text className="mb-2 px-5 font-montserrat-bold">Password</Text>
              <View className="flex-row items-center border border-black rounded-3xl px-5">
                <TextInput
                  className="flex-1 py-3 font-montserrat text-black"
                  placeholder="Masukkan password anda"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pl-3">
                  {showPassword ? (
                    <FontAwesome6 name="eye-slash" size={20} color="black" />
                  ) : (
                    <FontAwesome6 name="eye" size={20} color="black" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Nama */}
            <View className="mb-6">
              <Text className="mb-2 px-5 font-montserrat-bold">Nama</Text>
              <TextInput className="border border-black rounded-3xl px-5 font-montserrat" placeholder="Masukkan nama anda" />
            </View>

            {/* Tanggal Lahir */}
            <View className="mb-6">
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
                    if (date) setSelectedDate(date);
                  }}
                />
              )}
            </View>

            {/* Jenis Kelamin */}
            <View className="mb-6">
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
                <Pressable className="flex-1 justify-center items-center bg-black/30" onPress={() => setGenderModalVisible(false)}>
                  <View className="bg-white w-3/4 rounded-xl overflow-hidden">
                    {options.map((item) => (
                      <Pressable
                        key={item}
                        className="px-5 py-4 border-b border-gray-200"
                        onPress={() => {
                          setSelectedGender(item);
                          setGenderModalVisible(false);
                        }}
                      >
                        <Text className="font-montserrat text-lg">{item}</Text>
                      </Pressable>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </View>

            {/* Riwayat Penyakit */}
            <View className="mb-6">
              <Text className="mb-2 px-5 font-montserrat-bold">Riwayat Penyakit</Text>
              <TextInput className="border border-black rounded-3xl px-5 font-montserrat" placeholder="Masukkan riwayat penyakit anda" />
            </View>

            {/* Tinggi & Berat Badan */}
            <View className="flex-row justify-between mb-6">
              <View className="flex-1 mr-2">
                <Text className="mb-2 px-5 font-montserrat-bold">Tinggi Badan</Text>
                <TextInput className="border border-black rounded-3xl px-5 py-3 font-montserrat" placeholder="cm" keyboardType="numeric" />
              </View>
              <View className="flex-1 ml-2">
                <Text className="mb-2 px-5 font-montserrat-bold">Berat Badan</Text>
                <TextInput className="border border-black rounded-3xl px-5 py-3 font-montserrat" placeholder="kg" keyboardType="numeric" />
              </View>
            </View>

            {/* Button Daftar */}
            <View className="w-full mb-2">
              <Link href="/(tabs)/login" asChild>
                <TouchableOpacity className="bg-[#1A770A] w-full items-center py-3 rounded-3xl shadow-md active:opacity-80">
                  <Text className="text-white text-lg font-montserrat-bold">Daftar</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View className="flex-row justify-center w-full">
              <Text className="text-black text-sm font-montserrat-bold mr-1">Sudah punya akun?</Text>
              <TouchableOpacity className="active:opacity-80">
                <Link className="text-[#2A730B] text-sm font-montserrat-bold underline underline-offset-4" href="/(tabs)/login">Masuk</Link>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}