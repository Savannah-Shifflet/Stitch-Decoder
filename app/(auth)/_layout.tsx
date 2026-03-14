import { Redirect, Stack, useSegments } from "expo-router";
import { useAuthStore } from "@/stores/auth";

export default function AuthLayout() {
  const { session, profile } = useAuthStore();
  const segments = useSegments();
  const onOnboarding = segments[segments.length - 1] === "onboarding";

  // Allow authenticated users without a craft_preference to complete onboarding
  if (session && !onOnboarding && !(profile && !profile.craft_preference)) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
