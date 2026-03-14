import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Unit = "in" | "cm";

export default function SwatchCalculatorScreen() {
  const [unit, setUnit] = useState<Unit>("in");
  const [swatchWidth, setSwatchWidth] = useState("");
  const [swatchHeight, setSwatchHeight] = useState("");
  const [stitchCount, setStitchCount] = useState("");
  const [rowCount, setRowCount] = useState("");
  const [patternStGauge, setPatternStGauge] = useState("");
  const [patternRowGauge, setPatternRowGauge] = useState("");

  const w = parseFloat(swatchWidth);
  const h = parseFloat(swatchHeight);
  const st = parseFloat(stitchCount);
  const rows = parseFloat(rowCount);
  const pSt = parseFloat(patternStGauge);
  const pRow = parseFloat(patternRowGauge);

  const unitLabel = unit === "in" ? "in" : "cm";
  const standardSize = unit === "in" ? 4 : 10;
  const per = unit === "in" ? "per 4in" : "per 10cm";

  const stPerUnit = st && w ? st / w : null;
  const rowPerUnit = rows && h ? rows / h : null;
  const stPerStandard = stPerUnit ? (stPerUnit * standardSize).toFixed(1) : null;
  const rowPerStandard = rowPerUnit ? (rowPerUnit * standardSize).toFixed(1) : null;

  const stDiff = stPerStandard && pSt ? parseFloat(stPerStandard) - pSt : null;
  const rowDiff = rowPerStandard && pRow ? parseFloat(rowPerStandard) - pRow : null;

  const getGaugeStatus = (diff: number | null) => {
    if (diff === null) return null;
    if (Math.abs(diff) <= 0.5) return "match";
    return diff > 0 ? "tight" : "loose";
  };

  const stStatus = getGaugeStatus(stDiff);
  const rowStatus = getGaugeStatus(rowDiff);

  const adviceMap = {
    match: { text: "Gauge matches!", icon: "checkmark-circle" as const, color: "#5A8060", bg: "bg-sage-50", border: "border-sage-200", textColor: "text-sage-700" },
    tight: { text: "Too tight — try a larger needle/hook", icon: "arrow-up-circle" as const, color: "#C08040", bg: "bg-brand-50", border: "border-brand-200", textColor: "text-brand-700" },
    loose: { text: "Too loose — try a smaller needle/hook", icon: "arrow-down-circle" as const, color: "#C08040", bg: "bg-brand-50", border: "border-brand-200", textColor: "text-brand-700" },
  };

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Unit toggle */}
      <View className="flex-row bg-white border border-brand-200 rounded-xl p-1 mb-6">
        {(["in", "cm"] as Unit[]).map((u) => (
          <TouchableOpacity
            key={u}
            onPress={() => setUnit(u)}
            className={`flex-1 py-2 rounded-lg items-center ${unit === u ? "bg-brand-500" : ""}`}
          >
            <Text className={unit === u ? "text-white font-semibold" : "text-ink"}>
              {u === "in" ? "Inches" : "Centimeters"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Swatch measurements */}
      <Text className="text-ink font-semibold text-base mb-3">Your Swatch</Text>
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Text className="text-ink/60 text-xs mb-1">Width ({unitLabel})</Text>
          <TextInput
            className="bg-white border border-brand-200 rounded-xl px-4 py-3 text-ink"
            placeholder="e.g. 4"
            keyboardType="decimal-pad"
            value={swatchWidth}
            onChangeText={setSwatchWidth}
          />
        </View>
        <View className="flex-1">
          <Text className="text-ink/60 text-xs mb-1">Height ({unitLabel})</Text>
          <TextInput
            className="bg-white border border-brand-200 rounded-xl px-4 py-3 text-ink"
            placeholder="e.g. 4"
            keyboardType="decimal-pad"
            value={swatchHeight}
            onChangeText={setSwatchHeight}
          />
        </View>
      </View>

      <View className="flex-row gap-3 mb-6">
        <View className="flex-1">
          <Text className="text-ink/60 text-xs mb-1">Stitch count</Text>
          <TextInput
            className="bg-white border border-brand-200 rounded-xl px-4 py-3 text-ink"
            placeholder="e.g. 20"
            keyboardType="number-pad"
            value={stitchCount}
            onChangeText={setStitchCount}
          />
        </View>
        <View className="flex-1">
          <Text className="text-ink/60 text-xs mb-1">Row count</Text>
          <TextInput
            className="bg-white border border-brand-200 rounded-xl px-4 py-3 text-ink"
            placeholder="e.g. 24"
            keyboardType="number-pad"
            value={rowCount}
            onChangeText={setRowCount}
          />
        </View>
      </View>

      {/* Calculated gauge */}
      {(stPerStandard || rowPerStandard) && (
        <View className="bg-white rounded-2xl p-4 mb-6 border border-brand-100">
          <Text className="text-ink font-semibold mb-3">Your Gauge</Text>
          {stPerStandard && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-ink/70">Stitches {per}</Text>
              <Text className="text-ink font-bold text-base">{stPerStandard}</Text>
            </View>
          )}
          {rowPerStandard && (
            <View className="flex-row justify-between">
              <Text className="text-ink/70">Rows {per}</Text>
              <Text className="text-ink font-bold text-base">{rowPerStandard}</Text>
            </View>
          )}
        </View>
      )}

      {/* Pattern gauge comparison */}
      <Text className="text-ink font-semibold text-base mb-3">Compare to Pattern Gauge</Text>
      <Text className="text-ink/50 text-xs mb-3">Enter the gauge from your pattern to check if you need to adjust</Text>
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-ink/60 text-xs mb-1">Stitches {per}</Text>
          <TextInput
            className="bg-white border border-brand-200 rounded-xl px-4 py-3 text-ink"
            placeholder="e.g. 18"
            keyboardType="decimal-pad"
            value={patternStGauge}
            onChangeText={setPatternStGauge}
          />
        </View>
        <View className="flex-1">
          <Text className="text-ink/60 text-xs mb-1">Rows {per}</Text>
          <TextInput
            className="bg-white border border-brand-200 rounded-xl px-4 py-3 text-ink"
            placeholder="e.g. 22"
            keyboardType="decimal-pad"
            value={patternRowGauge}
            onChangeText={setPatternRowGauge}
          />
        </View>
      </View>

      {/* Gauge advice */}
      {stStatus && (
        <View className={`rounded-2xl p-4 mb-3 border ${adviceMap[stStatus].bg} ${adviceMap[stStatus].border}`}>
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name={adviceMap[stStatus].icon} size={18} color={adviceMap[stStatus].color} />
            <Text className={`font-semibold ${adviceMap[stStatus].textColor}`}>Stitch Gauge</Text>
          </View>
          <Text className={adviceMap[stStatus].textColor}>{adviceMap[stStatus].text}</Text>
          {stStatus !== "match" && stPerStandard && pSt && (
            <Text className="text-ink/50 text-xs mt-1">
              Yours: {stPerStandard}  ·  Pattern: {pSt}  ·  Diff: {stDiff! > 0 ? "+" : ""}{stDiff!.toFixed(1)}
            </Text>
          )}
        </View>
      )}

      {rowStatus && (
        <View className={`rounded-2xl p-4 mb-3 border ${adviceMap[rowStatus].bg} ${adviceMap[rowStatus].border}`}>
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name={adviceMap[rowStatus].icon} size={18} color={adviceMap[rowStatus].color} />
            <Text className={`font-semibold ${adviceMap[rowStatus].textColor}`}>Row Gauge</Text>
          </View>
          <Text className={adviceMap[rowStatus].textColor}>{adviceMap[rowStatus].text}</Text>
          {rowStatus !== "match" && rowPerStandard && pRow && (
            <Text className="text-ink/50 text-xs mt-1">
              Yours: {rowPerStandard}  ·  Pattern: {pRow}  ·  Diff: {rowDiff! > 0 ? "+" : ""}{rowDiff!.toFixed(1)}
            </Text>
          )}
        </View>
      )}

      {/* Yarn weight reference */}
      <Text className="text-ink font-semibold text-base mt-6 mb-3">Yarn Weight Reference</Text>
      <View className="bg-white rounded-2xl border border-brand-100 overflow-hidden mb-4">
        {[
          { name: "Lace", sts: "32–42", hook: "1.5–2.25mm" },
          { name: "Fingering", sts: "28–32", hook: "2.25–3.5mm" },
          { name: "Sport", sts: "24–28", hook: "3.5–4.5mm" },
          { name: "DK", sts: "21–24", hook: "4.5–5.5mm" },
          { name: "Worsted", sts: "16–20", hook: "5.5–6.5mm" },
          { name: "Bulky", sts: "12–15", hook: "6.5–9mm" },
          { name: "Super Bulky", sts: "6–11", hook: "9mm+" },
        ].map((w, i, arr) => (
          <View key={w.name} className={`flex-row px-4 py-3 ${i < arr.length - 1 ? "border-b border-brand-100" : ""}`}>
            <Text className="text-ink font-medium flex-1">{w.name}</Text>
            <Text className="text-ink/60 text-sm mr-4">{w.sts} st/4in</Text>
            <Text className="text-ink/60 text-sm">{w.hook}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
