import { View, Text } from "react-native";

// Implemented in Phase 2 after pattern sizing math walkthrough
export default function ResizeScreen() {
  return (
    <View className="flex-1 bg-cream items-center justify-center px-6">
      <Text className="text-ink font-semibold text-lg mb-2">Pattern Resize</Text>
      <Text className="text-ink/60 text-center">
        Coming in Phase 2 — gauge math engine
      </Text>
    </View>
  );
}
