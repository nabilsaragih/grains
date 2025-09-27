import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import manualStyles from '@/styles/manualStyles';
import { useAuth } from '@/contexts/AuthContext';

interface NutritionRow {
  id: number;
  label: string;
  value: string;
}

const UNIT_OPTIONS = ['gr', 'ml', 'pcs'];

export default function ManualScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ entry?: string | string[] }>();
  const navigation = useNavigation<any>();
  const entrySource = useMemo(() => (Array.isArray(params.entry) ? params.entry[0] : params.entry), [params.entry]);
  const [shouldRedirectOnBack, setShouldRedirectOnBack] = useState(() => entrySource === 'login');
  const [searchText, setSearchText] = useState('');
  const [productName, setProductName] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [portionUnitIndex, setPortionUnitIndex] = useState(0);
  const [nutritionRows, setNutritionRows] = useState<NutritionRow[]>([
    { id: Date.now(), label: '', value: '' },
  ]);

  const portionUnit = useMemo(() => UNIT_OPTIONS[portionUnitIndex % UNIT_OPTIONS.length], [portionUnitIndex]);

  const addNutritionRow = () => {
    setNutritionRows((prev) => [...prev, { id: Date.now(), label: '', value: '' }]);
  };

  const updateRow = (id: number, key: 'label' | 'value', nextValue: string) => {
    setNutritionRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: nextValue } : row)));
  };

  const removeRow = (id: number) => {
    setNutritionRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const cyclePortionUnit = () => {
    setPortionUnitIndex((prev) => prev + 1);
  };

  const isFilled = (value: string) => value.trim().length > 0;

  useEffect(() => {
    setShouldRedirectOnBack(entrySource === 'login');
  }, [entrySource]);

  useEffect(() => {
    if (!shouldRedirectOnBack) {
      return;
    }

    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      const actionType = event.data?.action?.type;

      if (actionType === 'GO_BACK' || actionType === 'POP' || actionType === 'POP_TO_TOP') {
        event.preventDefault();
        setShouldRedirectOnBack(false);
        router.replace('/(tabs)/profile');
      }
    });

    return unsubscribe;
  }, [navigation, router, shouldRedirectOnBack]);

  return (
    <SafeAreaView style={manualStyles.screen}>
      <LinearGradient
        style={manualStyles.gradient}
        colors={['#E4F4E4', '#F9FDF9']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <View style={manualStyles.headerWrapper}>
          <View style={manualStyles.headerActionPlaceholder} pointerEvents="none">
            <View style={manualStyles.ocrShortcut}>
              <FontAwesome6 name="camera" size={16} color="#1A770A" />
              <Text style={manualStyles.ocrShortcutText}>Scan produk (OCR)</Text>
            </View>
          </View>
          <Text style={manualStyles.title}>Masukkan Informasi Produk</Text>
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(tabs)/ocr')} style={manualStyles.ocrShortcut}>
            <FontAwesome6 name="camera" size={16} color="#1A770A" />
            <Text style={manualStyles.ocrShortcutText}>Scan produk (OCR)</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={manualStyles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={manualStyles.searchWrapper}>
            <View style={manualStyles.searchBar}>
              <Feather name="search" size={18} color="#6B7280" />
              <TextInput
                style={manualStyles.searchInput}
                placeholder="Temukan alternatif yang lebih sehat"
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity style={manualStyles.searchButton} activeOpacity={0.85}>
              <FontAwesome6 name="magnifying-glass" size={14} color="#FFFFFF" />
              <Text style={manualStyles.searchButtonText}>Cari</Text>
            </TouchableOpacity>
          </View>

          <View style={manualStyles.sectionCard}>
            <View style={manualStyles.infoRow}>
              <View style={[manualStyles.statusBadge, isFilled(productName) ? manualStyles.statusBadgeActive : null]}>
                <FontAwesome6 name="check" size={12} color={isFilled(productName) ? '#fff' : '#6B7280'} />
              </View>
              <View style={manualStyles.infoContent}>
                <Text style={manualStyles.infoLabel}>Nama Produk</Text>
                <TextInput
                  style={manualStyles.input}
                  placeholder="Contoh: Samyang"
                  placeholderTextColor="#9CA3AF"
                  value={productName}
                  onChangeText={setProductName}
                />
              </View>
            </View>

            <View style={manualStyles.infoRow}>
              <View style={[manualStyles.statusBadge, isFilled(portionSize) ? manualStyles.statusBadgeActive : null]}>
                <FontAwesome6 name="check" size={12} color={isFilled(portionSize) ? '#fff' : '#6B7280'} />
              </View>
              <View style={manualStyles.infoContent}>
                <Text style={manualStyles.infoLabel}>Ukuran Porsi</Text>
                <View style={manualStyles.portionRow}>
                  <TextInput
                    style={[manualStyles.input, manualStyles.portionInput]}
                    placeholder="195"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={portionSize}
                    onChangeText={setPortionSize}
                  />
                  <TouchableOpacity activeOpacity={0.85} style={manualStyles.unitChip} onPress={cyclePortionUnit}>
                    <Text style={manualStyles.unitChipText}>{portionUnit}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <Text style={manualStyles.sectionHeading}>Informasi nutrisi (per porsi):</Text>

          <View style={manualStyles.tableCard}>
            {nutritionRows.map((row, index) => (
              <View key={row.id} style={[manualStyles.tableRow, index === nutritionRows.length - 1 ? manualStyles.tableRowLast : null]}>
                <TextInput
                  style={[manualStyles.input, manualStyles.tableCell]}
                  placeholder="Kalori"
                  placeholderTextColor="#9CA3AF"
                  value={row.label}
                  onChangeText={(value) => updateRow(row.id, 'label', value)}
                />
                <TextInput
                  style={[manualStyles.input, manualStyles.tableCell]}
                  placeholder="218 Kcal"
                  placeholderTextColor="#9CA3AF"
                  value={row.value}
                  onChangeText={(value) => updateRow(row.id, 'value', value)}
                />
                <TouchableOpacity
                  style={manualStyles.rowAction}
                  onPress={() => removeRow(row.id)}
                  disabled={nutritionRows.length === 1}
                >
                  <FontAwesome6
                    name="trash"
                    size={16}
                    color={nutritionRows.length === 1 ? '#C7CED4' : '#B91C1C'}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={manualStyles.addButton} onPress={addNutritionRow} activeOpacity={0.85}>
            <FontAwesome6 name="plus" size={16} color="#fff" />
            <Text style={manualStyles.addButtonText}>Tambahkan lebih banyak nutrisi</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={manualStyles.bottomNav}>
          <TouchableOpacity
            style={manualStyles.navItem}
            activeOpacity={0.85}
            onPress={() => router.replace('/(tabs)/manual')}
          >
            <FontAwesome6 name="house" size={18} color="#1A770A" />
            <Text style={[manualStyles.navLabel, manualStyles.navActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={manualStyles.navItem}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/ocr')}
          >
            <FontAwesome6 name="camera" size={18} color="#6B7280" />
            <Text style={manualStyles.navLabel}>OCR Input</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={manualStyles.navItem}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/result')}
          >
            <FontAwesome6 name="star" size={18} color="#6B7280" />
            <Text style={manualStyles.navLabel}>Rekomendasi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={manualStyles.navItem}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <FontAwesome6 name="user" size={18} color="#6B7280" />
            <Text style={manualStyles.navLabel}>Profil</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}











