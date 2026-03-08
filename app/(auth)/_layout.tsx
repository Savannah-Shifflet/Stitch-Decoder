import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/stores/auth";

export default function AuthLayout() {
  const { session } = useAuthStore();

  // Already signed in — redirect to app
  if (session) return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
