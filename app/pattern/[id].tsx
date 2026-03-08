import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePatternsStore } from "@/stores/patterns";

export default function PatternScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { patterns } = usePatternsStore();
  const pattern = patterns.find((p) => p.id === id);

  if (!pattern) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <Text className="text-ink/60">Pattern not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text className="text-2xl font-bold text-ink mb-1">{pattern.title}</Text>
        <Text className="text-ink/50 text-xs uppercase tracking-wide mb-6">{pattern.source}</Text>
        <Text className="text-ink leading-7 text-base">{pattern.raw_text}</Text>
      </ScrollView>

      {/* Action bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-brand-100 flex-row px-4 py-4 gap-3">
        <TouchableOpacity
          onPress={() => router.push(`/pattern/${id}/resize`)}
          className="flex-1 bg-brand-500 rounded-xl py-3 items-center"
        >
          <Text className="text-white font-semibold">Resize</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/pattern/${id}/export`)}
          className="flex-1 bg-white border border-brand-200 rounded-xl py-3 items-center"
        >
          <Text className="text-ink font-semibold">Export PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
