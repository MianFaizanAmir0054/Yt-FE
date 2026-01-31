"use client";

import { useState } from "react";

import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
} from "@/lib/store/api/projectsApi";

import {
  PageHeader,
  SearchBar,
  ProjectsGrid,
  LoadingState,
  ErrorState,
} from "./_components";

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // RTK Query hooks
  const {
    data: projectsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetProjectsQuery({});

  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const projects = projectsData?.projects || [];
  const isInitialLoading = isLoading && !projectsData;

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(projectId).unwrap();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.reelIdea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isInitialLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load projects"
        message={
          (error as { data?: { error?: string } })?.data?.error ||
          "Something went wrong. Please try again."
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your reel projects"
        isFetching={isFetching}
        showCreateButton
      />

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <ProjectsGrid
        projects={filteredProjects}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        searchQuery={searchQuery}
      />
    </div>
  );
}
