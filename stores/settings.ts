import { create } from "zustand";

interface SettingsState {
  region: "us" | "uk";
  setRegion: (region: "us" | "uk") => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  region: "us",
  setRegion: (region) => set({ region }),
}));
