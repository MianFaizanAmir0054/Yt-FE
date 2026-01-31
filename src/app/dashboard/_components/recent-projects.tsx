"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FolderKanban, Plus, ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { Project } from "@/types";
import { STATUS_CONFIG } from "@/constants";

interface RecentProjectsProps {
  projects: Project[];
  loading: boolean;
}

function ProjectSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
        <FolderKanban className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">No projects yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Create your first reel to get started
      </p>
      <Link href="/dashboard/projects/new">
        <Button
          variant="outline"
          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create your first reel
        </Button>
      </Link>
    </div>
  );
}

function ProjectItem({ project, index }: { project: Project; index: number }) {
  const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/dashboard/projects/${project._id}`}
        className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
          <Play className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate group-hover:text-purple-400 transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {project.reelIdea}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`${config.bgColor} ${config.color} border shrink-0`}
        >
          {config.label}
        </Badge>
        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </motion.div>
  );
}

export function RecentProjects({ projects, loading }: RecentProjectsProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">Recent Projects</CardTitle>
          <CardDescription>Your latest video creation projects</CardDescription>
        </div>
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm" className="text-purple-400">
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <ProjectSkeleton />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-border/50">
            {projects.map((project, index) => (
              <ProjectItem key={project._id} project={project} index={index} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
