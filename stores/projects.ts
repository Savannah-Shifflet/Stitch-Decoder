import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type ProjectStatus = "queued" | "in_progress" | "completed";

export interface Project {
  id: string;
  user_id: string;
  pattern_id: string | null;
  name: string;
  status: ProjectStatus;
  notes: string | null;
  progress_row: number;
  created_at: string;
}

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  fetchProjects: (userId: string) => Promise<void>;
  addProject: (userId: string, data: { name: string; pattern_id?: string; notes?: string }) => Promise<string | null>;
  updateStatus: (id: string, status: ProjectStatus) => Promise<void>;
  updateRow: (id: string, row: number) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: false,

  fetchProjects: async (userId) => {
    set({ loading: true });
    const { data } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    set({ projects: (data as Project[]) ?? [], loading: false });
  },

  addProject: async (userId, { name, pattern_id, notes }) => {
    const { data, error } = await supabase
      .from("user_projects")
      .insert({ user_id: userId, name, pattern_id: pattern_id ?? null, notes: notes ?? null, status: "queued", progress_row: 0 })
      .select()
      .single();
    if (error) return error.message;
    set((state) => ({ projects: [data as Project, ...state.projects] }));
    return null;
  },

  updateStatus: async (id, status) => {
    await supabase.from("user_projects").update({ status }).eq("id", id);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p)),
    }));
  },

  updateRow: async (id, progress_row) => {
    await supabase.from("user_projects").update({ progress_row }).eq("id", id);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, progress_row } : p)),
    }));
  },

  updateNotes: async (id, notes) => {
    await supabase.from("user_projects").update({ notes }).eq("id", id);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, notes } : p)),
    }));
  },

  deleteProject: async (id) => {
    await supabase.from("user_projects").delete().eq("id", id);
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
  },
}));
