"use client";

import { useMemo } from "react";
import { useGetProjectsQuery } from "@/lib/store/api/projectsApi";
import { ProjectStats } from "@/types";
import { Project } from "@/lib/schemas";

interface UseFetchProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  stats: ProjectStats;
  completionRate: number;
}

interface UseFetchProjectsParams {
  workspaceId?: string;
  channelId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useFetchProjects(params: UseFetchProjectsParams = {}): UseFetchProjectsReturn {
  const { data, isLoading, error, refetch } = useGetProjectsQuery(params);
  
  const projects = data?.projects || [];

  const stats: ProjectStats = useMemo(() => ({
    total: projects.length,
    completed: projects.filter((p) => p.status === "published" || p.status === "approved").length,
    inProgress: projects.filter(
      (p) => !["published", "approved", "failed", "draft"].includes(p.status)
    ).length,
    failed: projects.filter((p) => p.status === "failed").length,
  }), [projects]);

  const completionRate = useMemo(() => 
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    [stats.total, stats.completed]
  );

  return {
    projects,
    loading: isLoading,
    error: error ? (error as any)?.data?.error || "Failed to fetch projects" : null,
    refetch,
    stats,
    completionRate,
  };
}
