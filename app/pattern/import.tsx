import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { usePatternsStore } from "@/stores/patterns";

export default function ImportPatternScreen() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { addPattern } = usePatternsStore();

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await api.parsePattern({ raw_text: text, title: title || "Untitled Pattern" });
      addPattern(result);
      router.replace(`/pattern/${result.id}`);
    } catch (e: any) {
      Alert.alert("Parse failed", e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 16 }}>
      <TextInput
        className="bg-white border border-brand-200 rounded-xl px-4 py-3 mb-3 text-ink"
        placeholder="Pattern title (optional)"
        placeholderTextColor="#9B8E82"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        className="bg-white border border-brand-200 rounded-xl px-4 py-3 mb-6 text-ink"
        placeholder="Paste your pattern text here..."
        placeholderTextColor="#9B8E82"
        multiline
        numberOfLines={12}
        textAlignVertical="top"
        style={{ minHeight: 200 }}
        value={text}
        onChangeText={setText}
      />
      <TouchableOpacity
        onPress={handleParse}
        disabled={!text.trim() || loading}
        className={`rounded-xl py-4 items-center ${text.trim() ? "bg-brand-500" : "bg-brand-200"}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-base">Decode Pattern</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
