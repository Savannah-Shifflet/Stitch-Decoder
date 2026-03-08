import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";

type CraftPreference = "crochet" | "knitting" | "both";
type SkillLevel = "beginner" | "intermediate" | "advanced";

export default function OnboardingScreen() {
  const [craft, setCraft] = useState<CraftPreference | null>(null);
  const [skill, setSkill] = useState<SkillLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const { session } = useAuthStore();

  const handleFinish = async () => {
    if (!craft || !skill || !session) return;
    setLoading(true);
    await supabase
      .from("profiles")
      .update({ craft_preference: craft, skill_level: skill })
      .eq("id", session.user.id);
    setLoading(false);
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 bg-cream px-6 pt-16">
      <Text className="text-3xl font-bold text-ink mb-2">Let's personalize</Text>
      <Text className="text-ink/60 mb-10">Help us show you the right content</Text>

      <Text className="text-lg font-semibold text-ink mb-4">I mainly do...</Text>
      <View className="flex-row gap-3 mb-10">
        {(["crochet", "knitting", "both"] as CraftPreference[]).map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCraft(c)}
            className={`flex-1 rounded-xl py-4 items-center border ${
              craft === c ? "bg-brand-500 border-brand-500" : "bg-white border-brand-200"
            }`}
          >
            <Text className={craft === c ? "text-white font-semibold" : "text-ink"}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-lg font-semibold text-ink mb-4">My skill level...</Text>
      <View className="flex-row gap-3 mb-12">
        {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSkill(s)}
            className={`flex-1 rounded-xl py-4 items-center border ${
              skill === s ? "bg-brand-500 border-brand-500" : "bg-white border-brand-200"
            }`}
          >
            <Text className={skill === s ? "text-white font-semibold" : "text-ink"}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleFinish}
        disabled={!craft || !skill || loading}
        className={`rounded-xl py-4 items-center ${
          craft && skill ? "bg-brand-500" : "bg-brand-200"
        }`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-base">Get Started</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
