"use client";

import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  isFetching?: boolean;
  showCreateButton?: boolean;
  createButtonHref?: string;
  createButtonText?: string;
}

export function PageHeader({
  title,
  description,
  isFetching = false,
  showCreateButton = false,
  createButtonHref = "/dashboard/projects/new",
  createButtonText = "New Project",
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {title}
          {isFetching && (
            <Loader2 className="inline-block w-5 h-5 ml-2 animate-spin text-purple-400" />
          )}
        </h1>
        {description && <p className="text-gray-400">{description}</p>}
      </div>
      {showCreateButton && (
        <Link
          href={createButtonHref}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          {createButtonText}
        </Link>
      )}
    </div>
  );
}
