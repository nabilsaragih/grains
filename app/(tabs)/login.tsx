import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Link } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-none pt-16 px-8 py-4">
        <Link href="/" asChild>
          <TouchableOpacity>
            <MaterialIcons name="keyboard-backspace" size={36} color="black" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-8">
        <Text className="text-2xl font-montserrat-bold mt-6 text-center">Selamat Datang!</Text>

        {/* Email Field */}
        <View className="mt-8 mb-6">
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

        {/* Password Field */}
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
              <FontAwesome6 name={showPassword ? "eye-slash" : "eye"} size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <View className="w-full mb-2">
          <Link href="/(tabs)/login" asChild>
            <TouchableOpacity className="bg-[#1A770A] w-full items-center py-3 rounded-3xl shadow-md active:opacity-80">
              <Text className="text-white text-lg font-montserrat-bold">Login</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Register Prompt */}
        <View className="flex-row justify-center w-full mt-2">
          <Text className="text-black text-sm font-montserrat-bold mr-1">Belum punya akun?</Text>
          <Link className="text-[#2A730B] text-sm font-montserrat-bold underline underline-offset-4" href="/(tabs)/signup">
            Daftar
          </Link>
        </View>
      </View>
    </View>
  );
}
