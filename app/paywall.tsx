import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// RevenueCat wired up in Phase 7
export default function PaywallScreen() {
  const features = [
    "Unlimited PDF exports (no watermark)",
    "Ravelry sync & import",
    "Premium tutorials",
    "Advanced pattern tips",
    "Priority support",
  ];

  return (
    <View className="flex-1 bg-cream px-6 pt-10">
      <View className="items-center mb-8">
        <Ionicons name="star" size={48} color="#C08040" />
        <Text className="text-2xl font-bold text-ink mt-3 mb-1">Go Premium</Text>
        <Text className="text-ink/60 text-center">Everything you need to master your craft</Text>
      </View>

      <View className="bg-white rounded-2xl p-5 mb-6 border border-brand-100">
        {features.map((f) => (
          <View key={f} className="flex-row items-center gap-3 mb-3">
            <Ionicons name="checkmark-circle" size={20} color="#5A8060" />
            <Text className="text-ink flex-1">{f}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity className="bg-brand-500 rounded-xl py-4 items-center mb-3">
        <Text className="text-white font-bold text-base">$4.99 / month</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-sage-500 rounded-xl py-4 items-center mb-6">
        <Text className="text-white font-bold text-base">$39.99 / year  </Text>
        <Text className="text-white/80 text-xs">Save 33%</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} className="items-center">
        <Text className="text-ink/50">Maybe later</Text>
      </TouchableOpacity>
    </View>
  );
}
