import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-linking";

interface Profile {
  id: string;
  username: string | null;
  subscription_tier: "free" | "premium";
  craft_preference: "crochet" | "knitting" | "both" | null;
  skill_level: "beginner" | "intermediate" | "advanced" | null;
  ravelry_username: string | null;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  initialized: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await get().fetchProfile(session.user.id);
    }
    set({ session, initialized: true });

    // Listen for auth changes (token refresh, sign out)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session });
      if (session) await get().fetchProfile(session.user.id);
      else set({ profile: null });
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  },

  signInWithGoogle: async () => {
    const redirectTo = makeRedirectUri({ scheme: "stitchdecoder", path: "auth/callback" });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === "success") {
        const url = result.url;
        const params = new URLSearchParams(url.split("#")[1]);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
      }
    }
  },

  signInWithApple: async () => {
    const redirectTo = makeRedirectUri({ scheme: "stitchdecoder", path: "auth/callback" });
    const { data } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === "success") {
        const url = result.url;
        const params = new URLSearchParams(url.split("#")[1]);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
      }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },

  fetchProfile: async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, subscription_tier, craft_preference, skill_level, ravelry_username")
      .eq("id", userId)
      .single();
    if (data) set({ profile: data as Profile });
  },
}));
