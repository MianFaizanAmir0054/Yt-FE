"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  GripVertical,
  Trash2,
  Plus,
  Image as ImageIcon,
  Clock,
  MessageSquare,
  Upload,
  X,
  RefreshCw,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useGetProjectQuery,
  useUpdateTimelineMutation,
  useGenerateImagesMutation,
} from "@/lib/store/api/projectsApi";
import { Scene, Project } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getUploadsUrl = (imagePath?: string) => {
  if (!imagePath) return "";
  const normalized = imagePath.replace(/\\/g, "/");
  const uploadsIndex = normalized.lastIndexOf("/uploads/");
  const relative = uploadsIndex >= 0
    ? normalized.slice(uploadsIndex + "/uploads/".length)
    : normalized;
  const encoded = relative.split("/").map(encodeURIComponent).join("/");
  return `${API_URL}/api/files/uploads/${encoded}`;
};

// Scene and Project types are imported from shared types

interface SortableSceneProps {
  scene: Scene;
  index: number;
  onUpdate: (index: number, field: keyof Scene, value: string | number) => void;
  onDelete: (index: number) => void;
  onImageUpload: (index: number, file: File) => void;
  onRegenerateImage: (index: number) => void;
  isRegenerating: boolean;
}

function SortableScene({
  scene,
  index,
  onUpdate,
  onDelete,
  onImageUpload,
  onRegenerateImage,
  isRegenerating,
}: SortableSceneProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id || `scene-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(":");
    if (parts.length === 2) {
      const [mins, secsMs] = parts;
      const [secs, ms] = secsMs.split(".");
      return (
        parseInt(mins) * 60 +
        parseInt(secs || "0") +
        parseInt(ms || "0") / 100
      );
    }
    return parseFloat(timeStr) || 0;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
    >
      <div className="flex items-stretch">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center px-3 bg-gray-750 cursor-grab active:cursor-grabbing hover:bg-gray-700 transition-colors"
        >
          <GripVertical className="text-gray-500" size={20} />
        </div>

        {/* Scene Content */}
        <div className="flex-1 p-4 space-y-4">
          {/* Scene Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-400">
              Scene {index + 1}
            </span>
            <button
              onClick={() => onDelete(index)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <label className="text-xs text-gray-500">Start</label>
              <input
                type="text"
                value={formatTime(scene.startTime)}
                onChange={(e) =>
                  onUpdate(index, "startTime", parseTime(e.target.value))
                }
                className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">End</label>
              <input
                type="text"
                value={formatTime(scene.endTime)}
                onChange={(e) =>
                  onUpdate(index, "endTime", parseTime(e.target.value))
                }
                className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <span className="text-xs text-gray-500">
              Duration: {(scene.endTime - scene.startTime).toFixed(2)}s
            </span>
          </div>

          {/* Subtitle */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-gray-500" />
              <label className="text-xs text-gray-500">Subtitle</label>
            </div>
            <textarea
              value={scene.sceneText}
              onChange={(e) => onUpdate(index, "sceneText", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
              placeholder="Enter subtitle text..."
            />
          </div>

          {/* Image */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-gray-500" />
                <label className="text-xs text-gray-500">Background Image</label>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer">
                  <Upload size={14} className="inline mr-1" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onImageUpload(index, file);
                    }}
                  />
                </label>
                <button
                  onClick={() => onRegenerateImage(index)}
                  disabled={isRegenerating}
                  className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50"
                >
                  {isRegenerating ? (
                    <Loader2 size={14} className="inline mr-1 animate-spin" />
                  ) : (
                    <RefreshCw size={14} className="inline mr-1" />
                  )}
                  Regenerate
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              {scene.imagePath ? (
                <div className="relative w-32 h-20 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                  <img
                    src={getUploadsUrl(scene.imagePath)}
                    alt={`Scene ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-20 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="text-gray-600" size={24} />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={scene.imagePrompt || ""}
                  onChange={(e) => onUpdate(index, "imagePrompt", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Image prompt (for AI generation)..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: projectData, isLoading } = useGetProjectQuery(projectId);
  const [updateTimeline, { isLoading: isSaving }] = useUpdateTimelineMutation();
  const [generateImages, { isLoading: isGeneratingImages }] = useGenerateImagesMutation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!projectData?.project) return;
    setProject(projectData.project as Project);
    const timelineScenes = (projectData.project as Project)?.timeline?.scenes || [];
    setScenes(timelineScenes);
    setHasChanges(false);
  }, [projectData]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setScenes((items) => {
        const oldIndex = items.findIndex(
          (item) => (item.id || `scene-${items.indexOf(item)}`) === active.id
        );
        const newIndex = items.findIndex(
          (item) => (item.id || `scene-${items.indexOf(item)}`) === over.id
        );

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order property
        return newItems.map((item, idx) => ({ ...item, order: idx }));
      });
      setHasChanges(true);
    }
  };

  const handleUpdateScene = (
    index: number,
    field: keyof Scene,
    value: string | number
  ) => {
    setScenes((prev) =>
      prev.map((scene, i) => {
        if (i !== index) return scene;
        const updated = { ...scene, [field]: value } as Scene;
        if (field === "startTime" || field === "endTime") {
          updated.duration = Math.max(0, updated.endTime - updated.startTime);
        }
        return updated;
      })
    );
    setHasChanges(true);
  };

  const handleDeleteScene = (index: number) => {
    if (!confirm("Are you sure you want to delete this scene?")) return;
    setScenes((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleAddScene = () => {
    const lastScene = scenes[scenes.length - 1];
    const newStartTime = lastScene ? lastScene.endTime : 0;
    const newEndTime = newStartTime + 5; // Default 5 second scene

    const newScene: Scene = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `scene-${Date.now()}`,
      order: scenes.length,
      startTime: newStartTime,
      endTime: newEndTime,
      duration: newEndTime - newStartTime,
      sceneText: "",
      sceneDescription: "",
      imagePrompt: "",
      imageSource: "uploaded",
      subtitles: [],
    };

    setScenes((prev) => [...prev, newScene]);
    setHasChanges(true);
  };

  const handleImageUpload = async (_index: number, _file: File) => {
    alert("Image upload is not supported yet. Use image prompts and regenerate images instead.");
  };

  const handleRegenerateImage = async (index: number) => {
    const scene = scenes[index];
    if (!scene?.imagePrompt) {
      alert("Please enter an image prompt first");
      return;
    }

    setRegeneratingIndex(index);
    try {
      const data = await generateImages({ id: projectId, provider: "pexels" }).unwrap();
      const updatedTimeline = (data as { timeline?: { scenes?: Scene[] } }).timeline;
      if (updatedTimeline?.scenes) {
        setScenes(updatedTimeline.scenes);
      }
    } catch (error) {
      console.error("Failed to regenerate image:", error);
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleSave = async () => {
    const totalDuration = scenes.length
      ? Math.max(...scenes.map((s) => s.endTime))
      : 0;

    try {
      await updateTimeline({
        id: projectId,
        timeline: { totalDuration, scenes },
      }).unwrap();
      setHasChanges(false);
      alert("Timeline saved successfully!");
    } catch (error) {
      console.error("Failed to save timeline:", error);
      alert("Failed to save timeline");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Project not found</p>
        <Link href="/dashboard/projects" className="text-purple-400 hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="text-gray-400" size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Timeline Editor</h1>
            <p className="text-gray-400">{project.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-yellow-500">Unsaved changes</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Timeline Duration */}
      {project.timeline && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              Total Duration:{" "}
              <span className="text-white font-medium">
                {project.timeline.totalDuration.toFixed(2)}s
              </span>
            </span>
            <span className="text-gray-400">
              Scenes:{" "}
              <span className="text-white font-medium">{scenes.length}</span>
            </span>
          </div>
        </div>
      )}

      {/* Scenes */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={scenes.map((s, i) => s.id || `scene-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {scenes.map((scene, index) => (
              <SortableScene
                key={scene.id || `scene-${index}`}
                scene={scene}
                index={index}
                onUpdate={handleUpdateScene}
                onDelete={handleDeleteScene}
                onImageUpload={handleImageUpload}
                onRegenerateImage={handleRegenerateImage}
                isRegenerating={regeneratingIndex === index || isGeneratingImages}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Scene Button */}
      <button
        onClick={handleAddScene}
        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-purple-400 hover:border-purple-500 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add New Scene
      </button>

      {/* Keyboard Shortcuts */}
      <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-500">
        <p className="font-medium text-gray-400 mb-2">Tips:</p>
        <ul className="space-y-1">
          <li>• Drag scenes by the grip handle to reorder them</li>
          <li>• Time format: MM:SS.ms (e.g., 1:30.50 = 1 minute, 30.5 seconds)</li>
          <li>• Regenerate images with AI using the prompt</li>
          <li>• Don&apos;t forget to save your changes!</li>
        </ul>
      </div>
    </div>
  );
}
