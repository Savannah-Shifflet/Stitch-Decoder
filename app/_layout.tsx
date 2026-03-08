import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@/stores/auth";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize, initialized } = useAuthStore();

  useEffect(() => {
    initialize().finally(() => SplashScreen.hideAsync());
  }, []);

  if (!initialized) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pattern/[id]" options={{ headerShown: true, title: "Pattern" }} />
        <Stack.Screen name="pattern/[id]/resize" options={{ headerShown: true, title: "Resize Pattern" }} />
        <Stack.Screen name="pattern/[id]/export" options={{ headerShown: true, title: "Export" }} />
        <Stack.Screen name="pattern/import" options={{ headerShown: true, title: "Import Pattern" }} />
        <Stack.Screen name="tutorials/[id]" options={{ headerShown: true, title: "Tutorial" }} />
        <Stack.Screen name="swatch-calculator" options={{ headerShown: true, title: "Swatch Calculator" }} />
        <Stack.Screen name="paywall" options={{ presentation: "modal", title: "Go Premium" }} />
      </Stack>
    </>
  );
}
