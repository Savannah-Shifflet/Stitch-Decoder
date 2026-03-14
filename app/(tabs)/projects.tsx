import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth";
import { useProjectsStore, Project, ProjectStatus } from "@/stores/projects";
import { usePatternsStore } from "@/stores/patterns";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  queued: "Queued",
  in_progress: "In Progress",
  completed: "Completed",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  queued: "bg-brand-100 text-brand-700",
  in_progress: "bg-sage-100 text-sage-700",
  completed: "bg-gray-100 text-gray-600",
};

function ProjectCard({ project }: { project: Project }) {
  const { updateStatus, updateRow, deleteProject } = useProjectsStore();
  const { patterns } = usePatternsStore();
  const linkedPattern = patterns.find((p) => p.id === project.pattern_id);

  const handleDelete = () => {
    Alert.alert("Delete project", `Delete "${project.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteProject(project.id) },
    ]);
  };

  const cycleStatus = () => {
    const order: ProjectStatus[] = ["queued", "in_progress", "completed"];
    const next = order[(order.indexOf(project.status) + 1) % order.length];
    updateStatus(project.id, next);
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-brand-100">
      <View className="flex-row items-start justify-between mb-2">
        <Text className="text-ink font-semibold text-base flex-1 mr-2">{project.name}</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color="#9B8E82" />
        </TouchableOpacity>
      </View>

      {linkedPattern && (
        <Text className="text-ink/50 text-xs mb-2">Pattern: {linkedPattern.title}</Text>
      )}

      {/* Status badge */}
      <TouchableOpacity onPress={cycleStatus} className="self-start mb-3">
        <View className={`px-3 py-1 rounded-full ${STATUS_COLORS[project.status].split(" ")[0]}`}>
          <Text className={`text-xs font-medium ${STATUS_COLORS[project.status].split(" ")[1]}`}>
            {STATUS_LABELS[project.status]}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Row counter */}
      <View className="flex-row items-center gap-3">
        <Text className="text-ink/60 text-sm">Row:</Text>
        <TouchableOpacity
          onPress={() => updateRow(project.id, Math.max(0, project.progress_row - 1))}
          className="bg-brand-100 rounded-full w-8 h-8 items-center justify-center"
        >
          <Ionicons name="remove" size={16} color="#C08040" />
        </TouchableOpacity>
        <Text className="text-ink font-bold text-lg w-10 text-center">{project.progress_row}</Text>
        <TouchableOpacity
          onPress={() => updateRow(project.id, project.progress_row + 1)}
          className="bg-brand-500 rounded-full w-8 h-8 items-center justify-center"
        >
          <Ionicons name="add" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProjectsScreen() {
  const { session } = useAuthStore();
  const { projects, loading, fetchProjects, addProject } = useProjectsStore();
  const { patterns } = usePatternsStore();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) fetchProjects(session.user.id);
  }, [session]);

  const handleAdd = async () => {
    if (!name.trim() || !session) return;
    setSaving(true);
    const error = await addProject(session.user.id, {
      name: name.trim(),
      pattern_id: selectedPatternId ?? undefined,
    });
    setSaving(false);
    if (error) {
      Alert.alert("Error", error);
    } else {
      setName("");
      setSelectedPatternId(null);
      setShowModal(false);
    }
  };

  return (
    <View className="flex-1 bg-cream">
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="bg-brand-500 rounded-2xl p-5 mb-6 flex-row items-center gap-4"
          >
            <View className="bg-white/20 rounded-xl p-2">
              <Ionicons name="add" size={28} color="white" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">New Project</Text>
              <Text className="text-white/80 text-sm">Track your row progress</Text>
            </View>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#C08040" style={{ marginTop: 40 }} />
          ) : (
            <View className="items-center py-12">
              <Ionicons name="list-outline" size={56} color="#D4A96A" />
              <Text className="text-ink font-semibold text-lg mt-4 mb-2">No projects yet</Text>
              <Text className="text-ink/60 text-center">
                Start a new project to track your row progress
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => <ProjectCard project={item} />}
      />

      {/* New project modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-cream px-6 pt-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-ink">New Project</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#9B8E82" />
            </TouchableOpacity>
          </View>

          <Text className="text-ink/60 text-xs mb-1">Project name</Text>
          <TextInput
            className="bg-white border border-brand-200 rounded-xl px-4 py-3 mb-4 text-ink"
            placeholder="e.g. Blue Cable Sweater"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          {patterns.length > 0 && (
            <>
              <Text className="text-ink/60 text-xs mb-2">Link to pattern (optional)</Text>
              {patterns.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedPatternId(p.id === selectedPatternId ? null : p.id)}
                  className={`flex-row items-center justify-between bg-white border rounded-xl px-4 py-3 mb-2 ${
                    selectedPatternId === p.id ? "border-brand-500" : "border-brand-100"
                  }`}
                >
                  <Text className="text-ink flex-1 mr-2" numberOfLines={1}>{p.title}</Text>
                  {selectedPatternId === p.id && (
                    <Ionicons name="checkmark-circle" size={18} color="#C08040" />
                  )}
                </TouchableOpacity>
              ))}
              <View className="h-4" />
            </>
          )}

          <TouchableOpacity
            onPress={handleAdd}
            disabled={!name.trim() || saving}
            className={`rounded-xl py-4 items-center ${name.trim() ? "bg-brand-500" : "bg-brand-200"}`}
          >
            {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Create Project</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
