"use client";

import { useState, useCallback } from "react";
import { Project } from "@/types";

interface UseProjectActionsReturn {
  project: Project | null;
  loading: boolean;
  actionLoading: string | null;
  error: string;
  fetchProject: () => Promise<void>;
  handleResearch: () => Promise<void>;
  handleVoiceoverUpload: (file: File) => Promise<void>;
  handleGenerateImages: () => Promise<void>;
  handleGenerateVideo: () => Promise<void>;
  setError: (error: string) => void;
}

export function useProjectActions(projectId: string): UseProjectActionsReturn {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch project");
      }

      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const handleResearch = useCallback(async () => {
    setActionLoading("research");
    setError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: "60s", tone: "educational" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Research failed");
      }

      await fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setActionLoading(null);
    }
  }, [projectId, fetchProject]);

  const handleVoiceoverUpload = useCallback(
    async (file: File) => {
      setActionLoading("voiceover");
      setError("");

      try {
        const formData = new FormData();
        formData.append("audio", file);

        const res = await fetch(`/api/projects/${projectId}/voiceover`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        await fetchProject();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setActionLoading(null);
      }
    },
    [projectId, fetchProject]
  );

  const handleGenerateImages = useCallback(async () => {
    setActionLoading("images");
    setError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "pexels" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Image generation failed");
      }

      await fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setActionLoading(null);
    }
  }, [projectId, fetchProject]);

  const handleGenerateVideo = useCallback(async () => {
    setActionLoading("video");
    setError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Video generation failed");
      }

      await fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video generation failed");
    } finally {
      setActionLoading(null);
    }
  }, [projectId, fetchProject]);

  return {
    project,
    loading,
    actionLoading,
    error,
    fetchProject,
    handleResearch,
    handleVoiceoverUpload,
    handleGenerateImages,
    handleGenerateVideo,
    setError,
  };
}
