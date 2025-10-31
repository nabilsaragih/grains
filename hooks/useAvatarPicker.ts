'use client';

import { useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

function parseAssetToDataUri(asset: ImagePicker.ImagePickerAsset) {
  const mime = asset.mimeType ?? 'image/jpeg';
  return asset.base64 ? `data:${mime};base64,${asset.base64}` : asset.uri;
}

export function useAvatarPicker() {
  const pickAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      throw new Error('Berikan akses galeri untuk mengganti foto profil.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGE],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return parseAssetToDataUri(result.assets[0]);
  }, []);

  return { pickAvatar };
}
