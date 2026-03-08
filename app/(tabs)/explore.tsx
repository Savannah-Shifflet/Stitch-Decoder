import { View, Text, FlatList, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Placeholder — tutorials fetched from Go API in Phase 3
export default function ExploreScreen() {
  const [search, setSearch] = useState("");

  return (
    <View className="flex-1 bg-cream">
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-white border border-brand-200 rounded-xl px-4 py-2 gap-2">
          <Ionicons name="search" size={18} color="#9B8E82" />
          <TextInput
            className="flex-1 text-ink"
            placeholder="Search tutorials..."
            placeholderTextColor="#9B8E82"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View className="flex-1 items-center justify-center">
        <Ionicons name="play-circle-outline" size={56} color="#D4A96A" />
        <Text className="text-ink font-semibold text-lg mt-4 mb-2">Tutorials coming soon</Text>
        <Text className="text-ink/60 text-center px-8">
          Curated YouTube tutorials for every technique, seeded in Phase 3
        </Text>
      </View>
    </View>
  );
}
