"use client";

import { useState, useCallback } from "react";
import { Project, ProjectStats } from "@/types";

interface UseFetchProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  stats: ProjectStats;
  completionRate: number;
}

export function useFetchProjects(): UseFetchProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, []);

  const stats: ProjectStats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === "completed").length,
    inProgress: projects.filter(
      (p) => !["completed", "failed", "draft"].includes(p.status)
    ).length,
    failed: projects.filter((p) => p.status === "failed").length,
  };

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return {
    projects,
    loading,
    error,
    fetchProjects,
    stats,
    completionRate,
  };
}
