'use client';

import { ComponentProps, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppRoute = '/(app)/manual' | '/(app)/ocr' | '/(app)/result' | '/profile';

interface NavItem {
  label: string;
  route: AppRoute;
  icon: ComponentProps<typeof FontAwesome6>['name'];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Manual', route: '/(app)/manual', icon: 'house' },
  { label: 'OCR', route: '/(app)/ocr', icon: 'camera' },
  { label: 'Result', route: '/(app)/result', icon: 'star' },
  { label: 'Profile', route: '/profile', icon: 'user' },
];

export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname();

  const activeRoute: AppRoute = useMemo(() => {
    if (!pathname) {
      return '/(app)/manual';
    }

    if (pathname.startsWith('/manual') || pathname.startsWith('/(app)/manual')) {
      return '/(app)/manual';
    }
    if (pathname.startsWith('/ocr') || pathname.startsWith('/(app)/ocr')) {
      return '/(app)/ocr';
    }
    if (pathname.startsWith('/result') || pathname.startsWith('/(app)/result')) {
      return '/(app)/result';
    }
    if (
      pathname.startsWith('/profile') ||
      pathname.startsWith('/(app)/profile') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/(app)/settings')
    ) {
      return '/profile';
    }

    return '/(app)/manual';
  }, [pathname]);

  return (
    <SafeAreaView edges={['bottom']} className="bg-white">
      <View className="flex-row items-center border-t border-[#E5E7EB] bg-white px-2 py-2.5 shadow-sm shadow-black/10">
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.route;

          return (
            <TouchableOpacity
              key={item.route}
              className="flex-1 items-center justify-center gap-1"
              activeOpacity={0.85}
              onPress={() => {
                if (activeRoute !== item.route) {
                  router.replace(item.route);
                }
              }}
            >
              <FontAwesome6
                name={item.icon}
                size={18}
                color={isActive ? '#1A770A' : '#6B7280'}
              />
              <Text
                className={`text-xs font-montserrat ${isActive ? 'font-montserrat-bold text-[#1A770A]' : 'text-[#4B5563]'}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
