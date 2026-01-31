"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { motion } from "framer-motion";

import { useFetchProjects } from "@/hooks";
import { ANIMATION_VARIANTS } from "@/constants";
import {
  HeroSection,
  StatsGrid,
  RecentProjects,
  QuickActions,
} from "./_components";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { projects, loading, fetchProjects, stats, completionRate } =
    useFetchProjects();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const userName = session?.user?.name?.split(" ")[0];
  const recentProjects = projects.slice(0, 5);

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Hero Section with Globe */}
      <motion.div variants={ANIMATION_VARIANTS.item}>
        <HeroSection userName={userName} />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={ANIMATION_VARIANTS.item}>
        <StatsGrid
          stats={stats}
          loading={loading}
          completionRate={completionRate}
        />
      </motion.div>

      {/* Recent Projects */}
      <motion.div variants={ANIMATION_VARIANTS.item}>
        <RecentProjects projects={recentProjects} loading={loading} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={ANIMATION_VARIANTS.item}>
        <QuickActions />
      </motion.div>
    </motion.div>
  );
}
