"use client";

import Link from "next/link";
import { Plus, ArrowRight, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "@/components/ui/globe";

interface HeroSectionProps {
  userName?: string;
}

export function HeroSection({ userName }: HeroSectionProps) {
  return (
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
              Welcome back, {userName || "Creator"}!
            </span>
          </h1>

          <p className="text-muted-foreground mb-6 text-lg">
            Create stunning viral reels with AI. Your content reaches audiences
            worldwide.
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
                View Projects
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
