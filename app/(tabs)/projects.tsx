import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Placeholder — project tracking implemented in Phase 2
export default function ProjectsScreen() {
  return (
    <View className="flex-1 bg-cream items-center justify-center">
      <Ionicons name="list-outline" size={56} color="#D4A96A" />
      <Text className="text-ink font-semibold text-lg mt-4 mb-2">Active Projects</Text>
      <Text className="text-ink/60 text-center px-8">
        Track your row progress and project notes here
      </Text>
    </View>
  );
}
