"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { buildOutputsUrl } from "@/lib/utils";

interface ProjectHeaderProps {
  title: string;
  reelIdea: string;
  status: string;
  videoPath?: string;
}

export function ProjectHeader({
  title,
  reelIdea,
  status,
  videoPath,
}: ProjectHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-2"
        >
          <ArrowLeft size={18} />
          Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-gray-400 mt-1">{reelIdea}</p>
      </div>
      {status === "completed" && videoPath && (
        <a
          href={buildOutputsUrl(videoPath)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Download size={20} />
          Download Video
        </a>
      )}
    </div>
  );
}
