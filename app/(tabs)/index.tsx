import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePatternsStore } from "@/stores/patterns";

export default function HomeScreen() {
  const { patterns } = usePatternsStore();

  return (
    <View className="flex-1 bg-cream">
      <FlatList
        data={patterns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <TouchableOpacity
            onPress={() => router.push("/pattern/import")}
            className="bg-brand-500 rounded-2xl p-5 mb-6 flex-row items-center gap-4"
          >
            <View className="bg-white/20 rounded-xl p-2">
              <Ionicons name="add" size={28} color="white" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Import Pattern</Text>
              <Text className="text-white/80 text-sm">Paste text to decode abbreviations</Text>
            </View>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="document-text-outline" size={56} color="#D4A96A" />
            <Text className="text-ink font-semibold text-lg mt-4 mb-2">No patterns yet</Text>
            <Text className="text-ink/60 text-center">
              Import your first pattern above to get started
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/pattern/${item.id}`)}
            className="bg-white rounded-2xl p-4 mb-3 border border-brand-100"
          >
            <Text className="text-ink font-semibold text-base mb-1">{item.title}</Text>
            <Text className="text-ink/50 text-xs uppercase tracking-wide">{item.source}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
