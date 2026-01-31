"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
} from "@/lib/store/api/projectsApi";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  researching: "bg-blue-500",
  "script-ready": "bg-yellow-500",
  "voiceover-uploaded": "bg-orange-500",
  "images-ready": "bg-purple-500",
  processing: "bg-indigo-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  researching: "Researching",
  "script-ready": "Script Ready",
  "voiceover-uploaded": "Voiceover Uploaded",
  "images-ready": "Images Ready",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

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
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-lg font-semibold">Failed to load projects</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {(error as { data?: { error?: string } })?.data?.error || "Something went wrong. Please try again."}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Projects
            {isFetching && <Loader2 className="inline-block w-5 h-5 ml-2 animate-spin text-purple-400" />}
          </h1>
          <p className="text-gray-400">Manage your reel projects</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          New Project
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 mb-4">
            {searchQuery ? "No projects match your search" : "No projects yet"}
          </p>
          {!searchQuery && (
            <Link
              href="/dashboard/projects/new"
              className="text-purple-400 hover:text-purple-300"
            >
              Create your first reel →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
            >
              <Link
                href={`/dashboard/projects/${project._id}`}
                className="block p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white truncate pr-2">
                    {project.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium text-white rounded-full flex-shrink-0 ${
                      statusColors[project.status]
                    }`}
                  >
                    {statusLabels[project.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                  {project.reelIdea}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{project.aspectRatio}</span>
                  <span>
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
              <div className="px-4 py-3 border-t border-gray-700 flex justify-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(project._id);
                  }}
                  disabled={isDeleting}
                  className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
