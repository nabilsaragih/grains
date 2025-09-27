import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import profileStyles from '@/styles/profileStyles';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={profileStyles.screen}>
      <View style={profileStyles.header}>
        <Text style={profileStyles.title}>Profil</Text>
      </View>

      <View style={profileStyles.card}>
        <Text style={profileStyles.cardTitle}>Pengaturan Akun</Text>
        <Text style={profileStyles.cardDescription}>Kelola preferensi dan keamanan akun Anda.</Text>
        <TouchableOpacity style={profileStyles.actionButton} onPress={() => router.push('/settings')} activeOpacity={0.85}>
          <FontAwesome6 name="gear" size={18} color="#FFFFFF" />
          <Text style={profileStyles.actionButtonText}>Buka Pengaturan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
