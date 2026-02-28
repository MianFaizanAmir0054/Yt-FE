"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  useGetProjectQuery,
  useGenerateResearchMutation,
  useUploadVoiceoverMutation,
  useGenerateImagesMutation,
  useGenerateVideoMutation,
} from "@/lib/store/api/projectsApi";

interface UseProjectActionsReturn {
  project: ReturnType<typeof useGetProjectQuery>["data"];
  loading: boolean;
  actionLoading: string | null;
  videoProgress: number;
  error: string;
  refetch: () => void;
  handleResearch: (options?: { duration?: string; tone?: string }) => Promise<void>;
  handleVoiceoverUpload: (file: File) => Promise<void>;
  handleGenerateImages: (options?: { provider?: "pexels" | "segmind"; styleGuide?: string }) => Promise<void>;
  handleGenerateVideo: (options?: { subtitleStyle?: unknown }) => Promise<void>;
  setError: (error: string) => void;
}

export function useProjectActions(projectId: string): UseProjectActionsReturn {
  const { data: projectData, isLoading, refetch } = useGetProjectQuery(projectId);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [error, setError] = useState("");
  const videoProgressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [generateResearch] = useGenerateResearchMutation();
  const [uploadVoiceover] = useUploadVoiceoverMutation();
  const [generateImages] = useGenerateImagesMutation();
  const [generateVideo] = useGenerateVideoMutation();

  const clearVideoProgressTimer = useCallback(() => {
    if (videoProgressTimerRef.current) {
      clearInterval(videoProgressTimerRef.current);
      videoProgressTimerRef.current = null;
    }
  }, []);

  const startVideoProgress = useCallback(() => {
    clearVideoProgressTimer();
    setVideoProgress(7);
    videoProgressTimerRef.current = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 95) {
          return 95;
        }

        if (prev < 70) {
          return prev + 6;
        }

        return prev + 2;
      });
    }, 1400);
  }, [clearVideoProgressTimer]);

  useEffect(() => {
    return () => {
      clearVideoProgressTimer();
    };
  }, [clearVideoProgressTimer]);

  const handleResearch = useCallback(
    async (options?: { duration?: string; tone?: string }) => {
      setActionLoading("research");
      setError("");

      try {
        await generateResearch({
          id: projectId,
          duration: options?.duration || "60s",
          tone: options?.tone || "educational",
        }).unwrap();
        await refetch();
      } catch (err: any) {
        setError(err?.data?.error || err?.message || "Research failed");
      } finally {
        setActionLoading(null);
      }
    },
    [projectId, generateResearch, refetch]
  );

  const handleVoiceoverUpload = useCallback(
    async (file: File) => {
      setActionLoading("voiceover");
      setError("");

      try {
        await uploadVoiceover({
          id: projectId,
          audioFile: file,
        }).unwrap();
        await refetch();
      } catch (err: any) {
        setError(err?.data?.error || err?.message || "Upload failed");
      } finally {
        setActionLoading(null);
      }
    },
    [projectId, uploadVoiceover, refetch]
  );

  const handleGenerateImages = useCallback(
    async (options?: { provider?: "pexels" | "segmind"; styleGuide?: string }) => {
      setActionLoading("images");
      setError("");

      try {
        await generateImages({
          id: projectId,
          provider: options?.provider || "pexels",
          styleGuide: options?.styleGuide,
        }).unwrap();
        await refetch();
      } catch (err: any) {
        setError(err?.data?.error || err?.message || "Image generation failed");
      } finally {
        setActionLoading(null);
      }
    },
    [projectId, generateImages, refetch]
  );

  const handleGenerateVideo = useCallback(
    async (options?: { subtitleStyle?: unknown }) => {
      setActionLoading("video");
      setError("");
      startVideoProgress();

      try {
        await generateVideo({
          id: projectId,
          subtitleStyle: options?.subtitleStyle,
        }).unwrap();
        clearVideoProgressTimer();
        setVideoProgress(100);
        await refetch();
      } catch (err: any) {
        clearVideoProgressTimer();
        setVideoProgress(0);
        setError(err?.data?.error || err?.message || "Video generation failed");
      } finally {
        setActionLoading(null);
      }
    },
    [projectId, generateVideo, refetch, clearVideoProgressTimer, startVideoProgress]
  );

  return {
    project: projectData,
    loading: isLoading,
    actionLoading,
    videoProgress,
    error,
    refetch,
    handleResearch,
    handleVoiceoverUpload,
    handleGenerateImages,
    handleGenerateVideo,
    setError,
  };
}
