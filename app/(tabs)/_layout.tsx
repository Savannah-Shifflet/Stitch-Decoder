import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth";

export default function TabsLayout() {
  const { session, profile } = useAuthStore();

  if (!session) return <Redirect href="/(auth)/login" />;
  if (session && profile && !profile.craft_preference) return <Redirect href="/(auth)/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#C08040",
        tabBarInactiveTintColor: "#9B8E82",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F0DFC4",
        },
        headerStyle: { backgroundColor: "#F9F5F0" },
        headerTintColor: "#2C2318",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Patterns",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Tutorials",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
