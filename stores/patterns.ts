import { create } from "zustand";

export interface Pattern {
  id: string;
  title: string;
  raw_text: string;
  processed_json: Record<string, unknown> | null;
  size_params: Record<string, unknown> | null;
  source: "manual" | "ravelry" | "ocr";
  region: "us" | "uk";
  created_at: string;
}

interface PatternsState {
  patterns: Pattern[];
  addPattern: (pattern: Pattern) => void;
  removePattern: (id: string) => void;
  setPatterns: (patterns: Pattern[]) => void;
}

export const usePatternsStore = create<PatternsState>((set) => ({
  patterns: [],

  addPattern: (pattern) =>
    set((state) => ({ patterns: [pattern, ...state.patterns] })),

  removePattern: (id) =>
    set((state) => ({ patterns: state.patterns.filter((p) => p.id !== id) })),

  setPatterns: (patterns) => set({ patterns }),
}));
