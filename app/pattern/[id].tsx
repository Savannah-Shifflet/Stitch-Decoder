import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePatternsStore } from "@/stores/patterns";

interface PatternSection {
  title?: string;
  instructions: string;
}

interface ProcessedPattern {
  sections?: PatternSection[];
  abbreviations?: Record<string, string>;
  notes?: string;
}

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

  const processed = pattern.processed_json as ProcessedPattern | null;
  const hasProcessed = processed?.sections && processed.sections.length > 0;

  return (
    <View className="flex-1 bg-cream">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text className="text-2xl font-bold text-ink mb-1">{pattern.title}</Text>
        <View className="flex-row items-center gap-2 mb-6">
          <Text className="text-ink/50 text-xs uppercase tracking-wide">{pattern.source}</Text>
          <Text className="text-ink/30 text-xs">·</Text>
          <Text className="text-ink/50 text-xs uppercase tracking-wide">{pattern.region.toUpperCase()} terms</Text>
          {hasProcessed && (
            <>
              <Text className="text-ink/30 text-xs">·</Text>
              <View className="bg-sage-100 px-2 py-0.5 rounded-full">
                <Text className="text-sage-700 text-xs">Decoded</Text>
              </View>
            </>
          )}
        </View>

        {hasProcessed ? (
          <>
            {/* Abbreviation legend */}
            {processed!.abbreviations && Object.keys(processed!.abbreviations).length > 0 && (
              <View className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-6">
                <Text className="text-ink font-semibold mb-3">Abbreviations Used</Text>
                {Object.entries(processed!.abbreviations).map(([term, expansion]) => (
                  <View key={term} className="flex-row mb-1.5">
                    <Text className="text-brand-700 font-semibold w-16 text-sm">{term}</Text>
                    <Text className="text-ink/70 flex-1 text-sm">{expansion}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Notes */}
            {processed!.notes && (
              <View className="bg-white border border-brand-100 rounded-2xl p-4 mb-6">
                <Text className="text-ink font-semibold mb-2">Notes</Text>
                <Text className="text-ink/70 leading-6">{processed!.notes}</Text>
              </View>
            )}

            {/* Sections */}
            {processed!.sections!.map((section, i) => (
              <View key={i} className="mb-6">
                {section.title && (
                  <Text className="text-ink font-bold text-base mb-2">{section.title}</Text>
                )}
                <Text className="text-ink leading-7 text-base">{section.instructions}</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            <View className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-4 flex-row items-center gap-2">
              <Ionicons name="information-circle-outline" size={16} color="#C08040" />
              <Text className="text-brand-700 text-sm flex-1">
                Raw pattern text — connect the Go API to decode abbreviations
              </Text>
            </View>
            <Text className="text-ink leading-7 text-base">{pattern.raw_text}</Text>
          </>
        )}
      </ScrollView>

      {/* Action bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-brand-100 flex-row px-4 py-4 gap-3">
        <TouchableOpacity
          onPress={() => router.push(`/pattern/${id}/resize`)}
          className="flex-1 bg-brand-500 rounded-xl py-3 items-center flex-row justify-center gap-2"
        >
          <Ionicons name="resize" size={16} color="white" />
          <Text className="text-white font-semibold">Resize</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/pattern/${id}/export`)}
          className="flex-1 bg-white border border-brand-200 rounded-xl py-3 items-center flex-row justify-center gap-2"
        >
          <Ionicons name="document-outline" size={16} color="#2C2318" />
          <Text className="text-ink font-semibold">Export PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
