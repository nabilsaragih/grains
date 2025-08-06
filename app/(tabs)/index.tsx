import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <LinearGradient colors={['#4FC025', '#0E2903']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} className="flex-1 items-center justify-center">
      <Text className="text-6xl font-bold text-white font-montserrat" style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 }}>GRAINS</Text>
      <Image source={require('../../assets/images/home-footer.png')} className="absolute w-full h-full" resizeMode="contain" />

      <View className="mt-2 flex-row items-center justify-center">
        <Text className="text-xs font-marcellus text-white mr-2">Gemma-based RAG for Intelligent</Text>
        <Text className="text-4xl font-love-light text-white">Nutrition System</Text>
      </View>

      <View className="w-full px-6 mt-10">
          <Link href="/(tabs)/login" asChild>
            <TouchableOpacity className="bg-white w-full items-center px-6 py-3 rounded-3xl shadow-md active:opacity-80">
              <Text className="text-[#126007] text-base font-montserrat-bold">Login</Text>
            </TouchableOpacity>
          </Link>
      </View>

      <View className="w-full px-6 mt-3 flex-row justify-center">
        <Text className="text-white text-sm font-montserrat mr-1">Belum punya akun?</Text>
        <TouchableOpacity className="active:opacity-80">
          <Link className="text-white text-sm font-montserrat underline underline-offset-4" href="/(tabs)/signup">Daftar sekarang</Link>
        </TouchableOpacity>
      </View>

    </LinearGradient>
  );
}
