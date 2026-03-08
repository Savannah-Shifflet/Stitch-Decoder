import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Link } from "expo-router";
import { useAuthStore } from "@/stores/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithApple } = useAuthStore();

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    const error = await signIn(email, password);
    setLoading(false);
    if (error) Alert.alert("Sign in failed", error);
  };

  return (
    <View className="flex-1 bg-cream px-6 justify-center">
      <Text className="text-3xl font-bold text-ink mb-2">Welcome back</Text>
      <Text className="text-ink/60 mb-8">Sign in to Stitch Decoder</Text>

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
        placeholder="Password"
        placeholderTextColor="#9B8E82"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-brand-500 rounded-xl py-4 items-center mb-4"
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-base">Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white border border-brand-200 rounded-xl py-4 items-center mb-3"
        onPress={signInWithGoogle}
      >
        <Text className="text-ink font-semibold text-base">Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-ink rounded-xl py-4 items-center mb-8"
        onPress={signInWithApple}
      >
        <Text className="text-white font-semibold text-base">Continue with Apple</Text>
      </TouchableOpacity>

      <Link href="/(auth)/signup" asChild>
        <TouchableOpacity className="items-center">
          <Text className="text-brand-500">Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
