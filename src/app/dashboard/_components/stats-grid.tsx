"use client";

import {
  FolderKanban,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { ProjectStats } from "@/types";

interface StatsGridProps {
  stats: ProjectStats;
  loading: boolean;
  completionRate: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgClass: string;
  valueClass?: string;
  loading: boolean;
  footer?: React.ReactNode;
}

function StatCard({
  title,
  value,
  icon,
  iconBgClass,
  valueClass = "",
  loading,
  footer,
}: StatCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${iconBgClass}`}>{icon}</div>
        </div>
        {footer && <div className="mt-3">{footer}</div>}
      </CardContent>
    </Card>
  );
}

export function StatsGrid({ stats, loading, completionRate }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Projects"
        value={stats.total}
        icon={<FolderKanban className="w-5 h-5" />}
        iconBgClass="bg-purple-500/10 text-purple-400"
        loading={loading}
        footer={
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">
              {completionRate}% completion rate
            </span>
          </div>
        }
      />

      <StatCard
        title="Completed"
        value={stats.completed}
        icon={<CheckCircle className="w-5 h-5" />}
        iconBgClass="bg-green-500/10 text-green-400"
        valueClass="text-green-400"
        loading={loading}
        footer={<Progress value={completionRate} className="h-1.5" />}
      />

      <StatCard
        title="In Progress"
        value={stats.inProgress}
        icon={<Clock className="w-5 h-5" />}
        iconBgClass="bg-blue-500/10 text-blue-400"
        valueClass="text-blue-400"
        loading={loading}
        footer={
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">
              Active processing
            </span>
          </div>
        }
      />

      <StatCard
        title="Failed"
        value={stats.failed}
        icon={<AlertCircle className="w-5 h-5" />}
        iconBgClass="bg-red-500/10 text-red-400"
        valueClass="text-red-400"
        loading={loading}
        footer={
          stats.failed > 0 && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-red-400"
            >
              Review issues →
            </Button>
          )
        }
      />
    </div>
  );
}
