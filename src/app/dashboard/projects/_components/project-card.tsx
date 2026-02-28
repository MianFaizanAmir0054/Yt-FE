"use client";

import Link from "next/link";
import { Trash2, Loader2, FolderKanban } from "lucide-react";

import { STATUS_COLORS, STATUS_LABELS } from "@/constants";

interface Project {
  _id: string;
  title: string;
  reelIdea: string;
  status: string;
  aspectRatio: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
  isDeleting: boolean;
}

export function ProjectCard({ project, onDelete, isDeleting }: ProjectCardProps) {
  const isVideoProcessing = project.status === "processing";

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
      <Link href={`/dashboard/projects/${project._id}`} className="block p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-white truncate pr-2">
            {project.title}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-medium text-white rounded-full flex-shrink-0 ${
              STATUS_COLORS[project.status]
            }`}
          >
            {isVideoProcessing ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="animate-spin" size={12} />
                Compiling
              </span>
            ) : (
              STATUS_LABELS[project.status]
            )}
          </span>
        </div>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {project.reelIdea}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{project.aspectRatio}</span>
          <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
      </Link>
      <div className="px-4 py-3 border-t border-gray-700 flex justify-end">
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(project._id);
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
  );
}

interface ProjectsGridProps {
  projects: Project[];
  onDelete: (projectId: string) => void;
  isDeleting: boolean;
  searchQuery: string;
}

export function ProjectsGrid({
  projects,
  onDelete,
  isDeleting,
  searchQuery,
}: ProjectsGridProps) {
  if (projects.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
