import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";

interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  craft_type: string;
  difficulty: string;
  technique_tags: string[];
  premium_only: boolean;
}

export default function TutorialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("tutorials")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setTutorial(data as Tutorial);
        setLoading(false);
      });
  }, [id]);

  const openVideo = () => {
    if (!tutorial) return;
    WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${tutorial.youtube_id}`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator color="#C08040" />
      </View>
    );
  }

  if (!tutorial) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <Text className="text-ink/60">Tutorial not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* YouTube thumbnail / play button */}
      <TouchableOpacity
        onPress={openVideo}
        className="bg-ink rounded-2xl overflow-hidden mb-4 items-center justify-center"
        style={{ height: 200 }}
      >
        {/* YouTube thumbnail */}
        <View className="absolute inset-0 bg-ink/80 items-center justify-center">
          <Ionicons name="logo-youtube" size={64} color="#FF0000" />
          <Text className="text-white font-semibold mt-2">Watch on YouTube</Text>
        </View>
      </TouchableOpacity>

      <Text className="text-2xl font-bold text-ink mb-2">{tutorial.title}</Text>

      {/* Tags */}
      <View className="flex-row gap-2 flex-wrap mb-4">
        <View className="bg-brand-100 px-3 py-1 rounded-full">
          <Text className="text-brand-700 text-sm capitalize">{tutorial.craft_type}</Text>
        </View>
        <View className="bg-sage-100 px-3 py-1 rounded-full">
          <Text className="text-sage-700 text-sm capitalize">{tutorial.difficulty}</Text>
        </View>
        {tutorial.technique_tags?.map((tag) => (
          <View key={tag} className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-gray-600 text-sm">{tag}</Text>
          </View>
        ))}
      </View>

      {tutorial.description && (
        <Text className="text-ink/70 leading-6 mb-6">{tutorial.description}</Text>
      )}

      <TouchableOpacity
        onPress={openVideo}
        className="bg-brand-500 rounded-xl py-4 flex-row items-center justify-center gap-2"
      >
        <Ionicons name="play" size={18} color="white" />
        <Text className="text-white font-semibold text-base">Watch Tutorial</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
