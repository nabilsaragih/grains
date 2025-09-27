import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import settingsStyles from '@/styles/settingsStyles';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <SafeAreaView style={settingsStyles.screen}>
      <View style={settingsStyles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <FontAwesome6 name="arrow-left" size={20} color="#0F2E04" />
        </TouchableOpacity>
        <Text style={settingsStyles.title}>Pengaturan</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={settingsStyles.card}>
        <Text style={settingsStyles.cardTitle}>Keluar dari akun</Text>
        <Text style={settingsStyles.cardDescription}>Anda dapat masuk kembali kapan saja menggunakan email dan password.</Text>
        <TouchableOpacity style={settingsStyles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <FontAwesome6 name="arrow-right-from-bracket" size={18} color="#FFFFFF" />
          <Text style={settingsStyles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
