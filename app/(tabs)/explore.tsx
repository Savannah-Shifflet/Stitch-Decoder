import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";

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

type Filter = { craft?: string; difficulty?: string };

const CRAFT_OPTIONS = ["all", "crochet", "knitting", "both"];
const DIFF_OPTIONS = ["all", "beginner", "intermediate", "advanced"];

export default function ExploreScreen() {
  const { profile } = useAuthStore();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>({});

  const isPremium = profile?.subscription_tier === "premium";

  useEffect(() => {
    fetchTutorials();
  }, [filter]);

  const fetchTutorials = async () => {
    setLoading(true);
    let query = supabase
      .from("tutorials")
      .select("id, title, description, youtube_id, craft_type, difficulty, technique_tags, premium_only")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (filter.craft && filter.craft !== "all") query = query.eq("craft_type", filter.craft);
    if (filter.difficulty && filter.difficulty !== "all") query = query.eq("difficulty", filter.difficulty);

    const { data } = await query;
    setTutorials((data as Tutorial[]) ?? []);
    setLoading(false);
  };

  const filtered = search.trim()
    ? tutorials.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.technique_tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      )
    : tutorials;

  return (
    <View className="flex-1 bg-cream">
      {/* Search bar */}
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

      {/* Craft filter */}
      <View className="px-4 py-2">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CRAFT_OPTIONS}
          keyExtractor={(i) => i}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter((f) => ({ ...f, craft: item }))}
              className={`mr-2 px-4 py-1.5 rounded-full border ${
                (filter.craft ?? "all") === item
                  ? "bg-brand-500 border-brand-500"
                  : "bg-white border-brand-200"
              }`}
            >
              <Text className={`text-sm capitalize ${(filter.craft ?? "all") === item ? "text-white font-semibold" : "text-ink/70"}`}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Difficulty filter */}
      <View className="px-4 pb-2">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DIFF_OPTIONS}
          keyExtractor={(i) => i}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter((f) => ({ ...f, difficulty: item }))}
              className={`mr-2 px-4 py-1.5 rounded-full border ${
                (filter.difficulty ?? "all") === item
                  ? "bg-sage-500 border-sage-500"
                  : "bg-white border-brand-200"
              }`}
            >
              <Text className={`text-sm capitalize ${(filter.difficulty ?? "all") === item ? "text-white font-semibold" : "text-ink/70"}`}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Tutorial list */}
      {loading ? (
        <ActivityIndicator color="#C08040" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Ionicons name="play-circle-outline" size={56} color="#D4A96A" />
              <Text className="text-ink font-semibold text-lg mt-4 mb-2">No tutorials yet</Text>
              <Text className="text-ink/60 text-center px-8">
                Curated tutorials will appear here once added
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const locked = item.premium_only && !isPremium;
            return (
              <TouchableOpacity
                onPress={() => locked ? router.push("/paywall") : router.push(`/tutorials/${item.id}`)}
                className="bg-white rounded-2xl p-4 mb-3 border border-brand-100"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-ink font-semibold text-base mb-1">{item.title}</Text>
                    {item.description && (
                      <Text className="text-ink/60 text-sm mb-2" numberOfLines={2}>{item.description}</Text>
                    )}
                    <View className="flex-row gap-2 flex-wrap">
                      <View className="bg-brand-100 px-2 py-0.5 rounded-full">
                        <Text className="text-brand-700 text-xs capitalize">{item.craft_type}</Text>
                      </View>
                      <View className="bg-sage-100 px-2 py-0.5 rounded-full">
                        <Text className="text-sage-700 text-xs capitalize">{item.difficulty}</Text>
                      </View>
                      {item.technique_tags?.slice(0, 2).map((tag) => (
                        <View key={tag} className="bg-gray-100 px-2 py-0.5 rounded-full">
                          <Text className="text-gray-600 text-xs">{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View className="items-center justify-center">
                    {locked ? (
                      <Ionicons name="lock-closed" size={20} color="#9B8E82" />
                    ) : (
                      <Ionicons name="play-circle" size={36} color="#C08040" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
