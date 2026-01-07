'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import FooterNav from '@/components/FooterNav';
import AppModal from '@/components/AppModal';
import { supabase } from '@/lib/supabase';

interface UserProfilePayload {
  id: string;
  email: string | null;
  full_name: string | null;
  gender: string | null;
  height: string | null;
  weight: string | null;
  birth_date: string | null;
  medical_history: string | null;
}

const OCR_SEARCH_API_URL = process.env.EXPO_PUBLIC_OCR_SEARCH_URL;

type PermissionState = 'loading' | 'granted' | 'denied';

const normalizeOptionalString = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized.length ? normalized : null;
};

export default function OcrScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('loading');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });
  const [userProfile, setUserProfile] = useState<UserProfilePayload | null>(null);
  const [isFetchingUserProfile, setIsFetchingUserProfile] = useState(false);

  const isCameraMode = permissionState === 'granted' && !capturedPhotoUri && Platform.OS !== 'web';

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      setPermissionState('denied');
      return;
    }

    setPermissionState('loading');
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermissionState(status === 'granted' ? 'granted' : 'denied');
    } catch {
      setPermissionState('denied');
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const showModal = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    setModalConfig({ visible: true, title, message, type });
  }, []);

  const closeModal = useCallback(() => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  const fetchUserProfile = useCallback(
    async (options?: { silent?: boolean }): Promise<UserProfilePayload | null> => {
      setIsFetchingUserProfile(true);

      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          throw new Error(error?.message ?? 'Tidak dapat memuat data pengguna.');
        }

        const metadata = (data.user.user_metadata ?? {}) as Record<string, unknown>;

        const profile: UserProfilePayload = {
          id: data.user.id,
          email: normalizeOptionalString(data.user.email),
          full_name: normalizeOptionalString(metadata.full_name),
          gender: normalizeOptionalString(metadata.gender),
          height: normalizeOptionalString(metadata.height),
          weight: normalizeOptionalString(metadata.weight),
          birth_date: normalizeOptionalString(metadata.birth_date),
          medical_history: normalizeOptionalString(metadata.medical_history),
        };

        setUserProfile(profile);
        return profile;
      } catch (error) {
        console.warn('Failed to fetch user profile for OCR submission', error);
        setUserProfile(null);

        if (!options?.silent) {
          const message =
            error instanceof Error
              ? error.message
              : 'Terjadi kesalahan saat memuat profil pengguna.';
          showModal(
            'error',
            'Profil Tidak Dapat Dimuat',
            `${message} Silakan login ulang lalu coba lagi.`,
          );
        }

        return null;
      } finally {
        setIsFetchingUserProfile(false);
      }
    },
    [showModal],
  );

  useEffect(() => {
    void fetchUserProfile({ silent: true });
  }, [fetchUserProfile]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !cameraReady) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
        shutterSound: false,
      });
      setCapturedPhotoUri(photo.uri);
    } catch {
      showModal('error', 'Gagal Mengambil Foto', 'Terjadi kesalahan saat mengambil foto. Silakan coba lagi.');
    }
  }, [cameraReady, showModal]);

  const handleRetake = useCallback(() => {
    setCapturedPhotoUri(null);
    setCameraReady(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!capturedPhotoUri) {
      return;
    }

    if (!OCR_SEARCH_API_URL) {
      showModal(
        'error',
        'Konfigurasi Tidak Lengkap',
        'Harap set EXPO_PUBLIC_OCR_SEARCH_URL sebelum mengirim foto.',
      );
      return;
    }

    if (isUploading) {
      return;
    }

    if (isFetchingUserProfile) {
      showModal(
        'info',
        'Memuat Profil',
        'Profil Anda sedang dimuat. Silakan tunggu sesaat lalu coba lagi.',
      );
      return;
    }

    let profilePayload = userProfile;

    if (!profilePayload) {
      profilePayload = await fetchUserProfile();
    }

    if (!profilePayload) {
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: capturedPhotoUri,
        name: `ocr-${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);
      formData.append('userProfile', JSON.stringify(profilePayload));

      const response = await fetch(OCR_SEARCH_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload gagal diproses.');
      }

      showModal('success', 'Upload Berhasil', 'Foto berhasil dikirim untuk diproses.');
      setCapturedPhotoUri(null);
    } catch {
      showModal('error', 'Upload Gagal', 'Tidak dapat mengirim foto. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  }, [
    capturedPhotoUri,
    fetchUserProfile,
    isFetchingUserProfile,
    isUploading,
    showModal,
    userProfile,
  ]);

  const openSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      showModal('error', 'Tidak Dapat Membuka Pengaturan', 'Silakan atur izin kamera secara manual.');
    }
  }, [showModal]);

  const renderPermissionContent = () => {
    if (Platform.OS === 'web') {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-lg font-montserrat-bold text-[#0F2E04]">
            Kamera tidak didukung pada platform web.
          </Text>
        </View>
      );
    }

    if (permissionState === 'loading') {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1A770A" />
          <Text className="mt-4 font-montserrat text-base text-[#4B5563]">Meminta izin kamera...</Text>
        </View>
      );
    }

    if (permissionState === 'denied') {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center text-lg font-montserrat-bold text-[#0F2E04]">
            Akses kamera dibutuhkan
          </Text>
          <Text className="mb-6 text-center font-montserrat text-base text-[#4B5563]">
            Kami memerlukan izin kamera untuk memindai label produk. Silakan berikan akses melalui pengaturan.
          </Text>
          <View className="w-full gap-3">
            <TouchableOpacity
              className="items-center rounded-2xl bg-[#1A770A] py-3"
              activeOpacity={0.85}
              onPress={requestPermission}
            >
              <Text className="font-montserrat-bold text-white">Coba Lagi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center rounded-2xl border border-[#1A770A] py-3"
              activeOpacity={0.85}
              onPress={openSettings}
            >
              <Text className="font-montserrat-bold text-[#1A770A]">Buka Pengaturan</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  const cameraContent = useMemo(() => {
    if (!isCameraMode) {
      return null;
    }

    return (
      <View className="flex-1 px-6 pb-6 pt-4">
        <View className="flex-1 overflow-hidden rounded-3xl bg-black">
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
            ratio="16:9"
            onCameraReady={() => setCameraReady(true)}
          />
        </View>

        <View className="mt-6 items-center">
          <TouchableOpacity
            className="h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#1A770A]"
            onPress={handleCapture}
            disabled={!cameraReady}
            activeOpacity={0.8}
            style={{ opacity: cameraReady ? 1 : 0.5 }}
          >
            <View className="h-12 w-12 rounded-full bg-white/80" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [handleCapture, isCameraMode, cameraReady]);

  const previewContent = useMemo(() => {
    if (!capturedPhotoUri || Platform.OS === 'web') {
      return null;
    }

    return (
      <View className="flex-1 px-6 pb-6 pt-4">
        <View className="flex-1 overflow-hidden rounded-3xl bg-black">
          <Image source={{ uri: capturedPhotoUri }} className="h-full w-full" resizeMode="cover" />
        </View>

        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity
            className="flex-1 items-center justify-center rounded-2xl border border-[#1A770A] py-3"
            onPress={handleRetake}
            disabled={isUploading}
            activeOpacity={0.85}
            style={{ opacity: isUploading ? 0.7 : 1 }}
          >
            <Text className="font-montserrat-bold text-[#1A770A]">Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 items-center justify-center rounded-2xl bg-[#1A770A] py-3"
            onPress={handleUpload}
            disabled={isUploading}
            activeOpacity={0.85}
            style={{ opacity: isUploading ? 0.7 : 1 }}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-montserrat-bold text-white">Use Photo</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [capturedPhotoUri, handleRetake, handleUpload, isUploading]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {permissionState !== 'granted' || Platform.OS === 'web' ? (
          renderPermissionContent()
        ) : capturedPhotoUri ? (
          previewContent
        ) : (
          cameraContent
        )}
      </View>
      <FooterNav />

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
