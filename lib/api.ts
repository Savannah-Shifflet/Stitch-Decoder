import { supabase } from "@/lib/supabase";
import { Pattern } from "@/stores/patterns";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return res;
}

export const api = {
  // Patterns
  parsePattern: async (payload: { raw_text: string; title: string }): Promise<Pattern> => {
    const res = await authFetch("/patterns/parse", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  getPattern: async (id: string): Promise<Pattern> => {
    const res = await authFetch(`/patterns/${id}`);
    return res.json();
  },

  deletePattern: async (id: string): Promise<void> => {
    await authFetch(`/patterns/${id}`, { method: "DELETE" });
  },

  resizePattern: async (id: string, sizeParams: Record<string, unknown>): Promise<Pattern> => {
    const res = await authFetch(`/patterns/resize`, {
      method: "POST",
      body: JSON.stringify({ id, size_params: sizeParams }),
    });
    return res.json();
  },

  // Tutorials
  listTutorials: async (params?: { craft_type?: string; difficulty?: string; q?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const path = query ? `/tutorials?${query}` : "/tutorials";
    const res = await authFetch(path);
    return res.json();
  },

  searchTutorials: async (q: string) => {
    const res = await authFetch(`/tutorials/search?q=${encodeURIComponent(q)}`);
    return res.json();
  },

  // Tips
  matchTips: async (patternText: string) => {
    const res = await authFetch("/tips/match", {
      method: "POST",
      body: JSON.stringify({ text: patternText }),
    });
    return res.json();
  },

  // Export
  exportPDF: async (patternId: string): Promise<{ url: string }> => {
    const res = await authFetch(`/export/pdf/${patternId}`, { method: "POST" });
    return res.json();
  },

  // Ravelry OAuth
  ravelryOAuthInit: async (): Promise<{ auth_url: string; state: string }> => {
    const res = await authFetch("/auth/ravelry/oauth/init", { method: "POST" });
    return res.json();
  },

  ravelryOAuthCallback: async (payload: { code: string; state: string }): Promise<void> => {
    await authFetch("/auth/ravelry/oauth/callback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
