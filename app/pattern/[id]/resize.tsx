import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePatternsStore } from "@/stores/patterns";
import { Ionicons } from "@expo/vector-icons";

function resizeStitches(original: number, patternGauge: number, userGauge: number): number {
  return Math.round((userGauge / patternGauge) * original);
}

function nearestMultiple(n: number, repeat: number): number {
  return Math.round(n / repeat) * repeat;
}

export default function ResizeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { patterns } = usePatternsStore();
  const pattern = patterns.find((p) => p.id === id);

  const [patternGauge, setPatternGauge] = useState("");
  const [userGauge, setUserGauge] = useState("");
  const [stitchRepeat, setStitchRepeat] = useState("");
  const [manualInput, setManualInput] = useState("");

  const pg = parseFloat(patternGauge);
  const ug = parseFloat(userGauge);
  const repeat = parseInt(stitchRepeat) || 1;
  const manual = parseInt(manualInput);

  const isValid = pg > 0 && ug > 0;
  const scaleFactor = isValid ? ug / pg : null;

  const resizedManual = isValid && manual > 0 ? resizeStitches(manual, pg, ug) : null;
  const resizedWithRepeat = resizedManual && repeat > 1 ? nearestMultiple(resizedManual, repeat) : resizedManual;

  // Extract all numbers from pattern raw_text to show common stitch counts
  const extractedNumbers = pattern?.raw_text
    ? [...new Set(
        [...pattern.raw_text.matchAll(/\b(\d{1,4})\s*(st|sts|sc|dc|hdc|tr|k|p|yo|ch)\b/gi)]
          .map((m) => parseInt(m[1]))
          .filter((n) => n >= 2 && n <= 999)
          .sort((a, b) => a - b)
      )]
    : [];

  const gaugeLabel = "per 4in";

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {pattern && (
        <Text className="text-ink/60 text-sm mb-6" numberOfLines={1}>
          {pattern.title}
        </Text>
      )}

      {/* Gauge inputs */}
      <Text className="text-ink font-semibold text-base mb-3">Gauge Settings</Text>
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Text className="text-ink/60 text-xs mb-1">Pattern gauge (sts {gaugeLabel})</Text>
          <TextInput
            className="bg-white border border-brand-200 rounded-xl px-4 py-3 text-ink"
            placeholder="e.g. 18"
            keyboardType="decimal-pad"
            value={patternGauge}
            onChangeText={setPatternGauge}
          />
        </View>
        <View className="flex-1">
          <Text className="text-ink/60 text-xs mb-1">Your gauge (sts {gaugeLabel})</Text>
          <TextInput
            className="bg-white border border-brand-200 rounded-xl px-4 py-3 text-ink"
            placeholder="e.g. 20"
            keyboardType="decimal-pad"
            value={userGauge}
            onChangeText={setUserGauge}
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-ink/60 text-xs mb-1">Stitch repeat (optional)</Text>
        <TextInput
          className="bg-white border border-brand-200 rounded-xl px-4 py-3 text-ink"
          placeholder="e.g. 6 — rounds to nearest multiple"
          keyboardType="number-pad"
          value={stitchRepeat}
          onChangeText={setStitchRepeat}
        />
      </View>

      {/* Scale factor */}
      {scaleFactor && (
        <View className="bg-brand-50 border border-brand-200 rounded-2xl p-4 mb-6 flex-row items-center gap-3">
          <Ionicons name="resize" size={20} color="#C08040" />
          <View>
            <Text className="text-brand-700 font-semibold">Scale factor: {scaleFactor.toFixed(3)}</Text>
            <Text className="text-brand-600 text-sm">
              {ug > pg
                ? `Your gauge is looser — stitch counts will decrease`
                : ug < pg
                ? `Your gauge is tighter — stitch counts will increase`
                : "Gauge matches — no adjustment needed"}
            </Text>
          </View>
        </View>
      )}

      {/* Manual calculator */}
      <Text className="text-ink font-semibold text-base mb-3">Stitch Count Calculator</Text>
      <View className="flex-row gap-3 items-center mb-2">
        <TextInput
          className="flex-1 bg-white border border-brand-200 rounded-xl px-4 py-3 text-ink"
          placeholder="Enter a stitch count"
          keyboardType="number-pad"
          value={manualInput}
          onChangeText={setManualInput}
          editable={isValid}
        />
        <Ionicons name="arrow-forward" size={20} color={isValid ? "#C08040" : "#D4A96A"} />
        <View className="flex-1 bg-white border border-brand-100 rounded-xl px-4 py-3 items-center">
          <Text className={`font-bold text-lg ${resizedWithRepeat ? "text-ink" : "text-ink/30"}`}>
            {resizedWithRepeat ?? "—"}
          </Text>
        </View>
      </View>
      {repeat > 1 && resizedManual && resizedWithRepeat !== resizedManual && (
        <Text className="text-ink/50 text-xs mb-4">
          Raw: {resizedManual} → rounded to nearest multiple of {repeat}: {resizedWithRepeat}
        </Text>
      )}

      {!isValid && (
        <Text className="text-ink/50 text-xs mb-6">Enter both gauge values above to enable the calculator</Text>
      )}

      {/* Detected stitch counts from pattern */}
      {extractedNumbers.length > 0 && isValid && (
        <View className="mt-4">
          <Text className="text-ink font-semibold text-base mb-3">Stitch Counts in This Pattern</Text>
          <View className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
            <View className="flex-row px-4 py-2 bg-brand-50 border-b border-brand-100">
              <Text className="text-ink/60 text-xs font-medium flex-1">Original</Text>
              <Text className="text-ink/60 text-xs font-medium flex-1 text-center">Resized</Text>
              {repeat > 1 && <Text className="text-ink/60 text-xs font-medium flex-1 text-right">w/ repeat</Text>}
            </View>
            {extractedNumbers.map((n) => {
              const resized = resizeStitches(n, pg, ug);
              const withRepeat = repeat > 1 ? nearestMultiple(resized, repeat) : resized;
              return (
                <View key={n} className="flex-row px-4 py-3 border-b border-brand-50">
                  <Text className="text-ink/70 flex-1">{n} sts</Text>
                  <Text className="text-ink font-semibold flex-1 text-center">{resized} sts</Text>
                  {repeat > 1 && (
                    <Text className={`flex-1 text-right text-sm ${withRepeat !== resized ? "text-brand-500 font-semibold" : "text-ink/50"}`}>
                      {withRepeat} sts
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
          <Text className="text-ink/40 text-xs mt-2">
            Numbers detected from pattern text. Verify against your pattern before knitting/crocheting.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
