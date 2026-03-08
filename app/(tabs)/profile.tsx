import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth";

export default function ProfileScreen() {
  const { session, profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  const isPremium = profile?.subscription_tier === "premium";

  return (
    <View className="flex-1 bg-cream px-4 pt-6">
      {/* Account info */}
      <View className="bg-white rounded-2xl p-4 mb-4 border border-brand-100">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="bg-brand-100 rounded-full w-12 h-12 items-center justify-center">
            <Ionicons name="person" size={24} color="#C08040" />
          </View>
          <View>
            <Text className="text-ink font-semibold">{session?.user.email}</Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Ionicons
                name={isPremium ? "star" : "star-outline"}
                size={12}
                color={isPremium ? "#C08040" : "#9B8E82"}
              />
              <Text className={`text-xs ${isPremium ? "text-brand-500" : "text-ink/50"}`}>
                {isPremium ? "Premium" : "Free plan"}
              </Text>
            </View>
          </View>
        </View>

        {!isPremium && (
          <TouchableOpacity className="bg-brand-500 rounded-xl py-3 items-center">
            <Text className="text-white font-semibold">Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Ravelry */}
      <View className="bg-white rounded-2xl p-4 mb-4 border border-brand-100">
        <Text className="text-ink font-semibold mb-3">Ravelry</Text>
        <TouchableOpacity className="flex-row items-center justify-between">
          <Text className="text-ink/70">Connect Ravelry account</Text>
          <Ionicons name="chevron-forward" size={18} color="#9B8E82" />
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View className="bg-white rounded-2xl p-4 mb-4 border border-brand-100">
        <Text className="text-ink font-semibold mb-3">Preferences</Text>
        <TouchableOpacity className="flex-row items-center justify-between py-2">
          <Text className="text-ink/70">Craft preference</Text>
          <Text className="text-brand-500 capitalize">{profile?.craft_preference ?? "—"}</Text>
        </TouchableOpacity>
        <View className="h-px bg-brand-100 my-1" />
        <TouchableOpacity className="flex-row items-center justify-between py-2">
          <Text className="text-ink/70">Skill level</Text>
          <Text className="text-brand-500 capitalize">{profile?.skill_level ?? "—"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-white rounded-2xl p-4 border border-brand-100 items-center"
      >
        <Text className="text-red-500 font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
