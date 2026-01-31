"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Play,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "@/components/ui/globe";

interface Project {
  _id: string;
  title: string;
  reelIdea: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<
  string,
  { color: string; bgColor: string; label: string }
> = {
  draft: {
    color: "text-slate-400",
    bgColor: "bg-slate-500/10 border-slate-500/20",
    label: "Draft",
  },
  researching: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    label: "Researching",
  },
  "script-ready": {
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
    label: "Script Ready",
  },
  "voiceover-uploaded": {
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    label: "Voiceover",
  },
  "images-ready": {
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    label: "Images Ready",
  },
  processing: {
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10 border-indigo-500/20",
    label: "Processing",
  },
  completed: {
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/20",
    label: "Completed",
  },
  failed: {
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    label: "Failed",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === "completed").length,
    inProgress: projects.filter(
      (p) => !["completed", "failed", "draft"].includes(p.status)
    ).length,
    failed: projects.filter((p) => p.status === "failed").length,
  };

  const recentProjects = projects.slice(0, 5);
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Hero Section with Globe */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-purple-950/50 via-background to-pink-950/30">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] -translate-y-1/4 translate-x-1/4">
            <Globe className="opacity-60" />
          </div>
          <CardContent className="relative z-10 p-6 lg:p-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="secondary"
                  className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-300 border-green-500/30"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Welcome back,{" "}
                  {session?.user?.name?.split(" ")[0] || "Creator"}!
                </span>
              </h1>

              <p className="text-muted-foreground mb-6 text-lg">
                Create stunning viral reels with AI. Your content reaches
                audiences worldwide.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/projects/new">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Reel
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard/projects">
                  <Button size="lg" variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    View Projects
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Projects
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stats.total}</p>
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">
                {completionRate}% completion rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-green-400">
                    {stats.completed}
                  </p>
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <Progress value={completionRate} className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-blue-400">
                    {stats.inProgress}
                  </p>
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Active processing
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Failed</p>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-red-400">
                    {stats.failed}
                  </p>
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            {stats.failed > 0 && (
              <Button
                variant="link"
                size="sm"
                className="mt-2 h-auto p-0 text-xs text-red-400"
              >
                Review issues →
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Projects */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Recent Projects</CardTitle>
              <CardDescription>
                Your latest video creation projects
              </CardDescription>
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
            ) : recentProjects.length === 0 ? (
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
            ) : (
              <div className="divide-y divide-border/50">
                {recentProjects.map((project, index) => {
                  const config = statusConfig[project.status] || statusConfig.draft;
                  return (
                    <motion.div
                      key={project._id}
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
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-gradient-to-br from-purple-950/30 to-transparent hover:from-purple-950/50 transition-colors cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Script Generator</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate viral scripts instantly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-pink-950/30 to-transparent hover:from-pink-950/50 transition-colors cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 transition-colors">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Quick Edit</h3>
                  <p className="text-sm text-muted-foreground">
                    Fast video assembly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-950/50 transition-colors cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your performance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
