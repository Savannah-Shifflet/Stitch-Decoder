import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Link, router } from "expo-router";
import { useAuthStore } from "@/stores/auth";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthStore();

  const handleSignUp = async () => {
    if (!email || !password) return;
    if (password.length < 8) {
      Alert.alert("Password too short", "Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error, needsConfirmation } = await signUp(email, password);
    setLoading(false);
    if (error) {
      Alert.alert("Sign up failed", error);
    } else if (needsConfirmation) {
      Alert.alert(
        "Check your email",
        "We sent a confirmation link to " + email + ". Click it to activate your account, then sign in.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    } else {
      router.replace("/(auth)/onboarding");
    }
  };

  return (
    <View className="flex-1 bg-cream px-6 justify-center">
      <Text className="text-3xl font-bold text-ink mb-2">Create account</Text>
      <Text className="text-ink/60 mb-8">Join Stitch Decoder for free</Text>

      <TextInput
        className="bg-white border border-brand-200 rounded-xl px-4 py-3 mb-3 text-ink"
        placeholder="Email"
        placeholderTextColor="#9B8E82"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="bg-white border border-brand-200 rounded-xl px-4 py-3 mb-6 text-ink"
        placeholder="Password (min 8 characters)"
        placeholderTextColor="#9B8E82"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-brand-500 rounded-xl py-4 items-center mb-8"
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-base">Create Account</Text>
        )}
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity className="items-center">
          <Text className="text-brand-500">Already have an account? Sign in</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
