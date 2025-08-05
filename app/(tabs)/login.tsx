import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialIcons";
import { Link } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className="flex-1 flex-col">

      <View className="flex-none bg-white">
        <View className="flex-row items-center justify-between px-8 py-4 pt-16">
          <Link href="/" asChild>
            <TouchableOpacity>
              <MaterialCommunityIcons name="keyboard-backspace" size={36} color="black" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View className="flex-[10] bg-white items-center">
        <Text className="text-2xl font-montserrat-bold mt-6">Selamat Datang!</Text>
        <View className="bg-white w-full h-full mt-16 flex-col flex-1 px-8">
          <View className="mb-6">
            <Text className="mb-2 px-5">Email</Text>
            <TextInput className="border border-black rounded-3xl px-5" placeholder="Masukkan email anda" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View className="mb-10">
            <Text className="mb-2 px-5">Password</Text>
            <TextInput className="border border-black rounded-3xl px-5" placeholder="Masukkan password anda" value={password} onChangeText={setPassword} secureTextEntry />
          </View>
          
          <View className="w-full mb-2">
            <Link href="/(tabs)/login" asChild>
              <TouchableOpacity className="bg-[#1A770A] w-full items-center py-3 rounded-3xl shadow-md active:opacity-80">
                <Text className="text-white text-base font-montserrat-bold">Login</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View className="flex-row justify-center w-full">
            <Text className="text-black text-sm font-montserrat-bold mr-1">Belum punya akun?</Text>
            <TouchableOpacity className="active:opacity-80">
              <Link className="text-[#2A730B] text-sm font-montserrat-bold underline underline-offset-4" href="/(tabs)/signup">Daftar</Link>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}