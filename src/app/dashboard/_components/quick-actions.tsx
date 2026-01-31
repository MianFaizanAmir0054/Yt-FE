"use client";

import { Sparkles, Zap, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "AI Script Generator",
    description: "Generate viral scripts instantly",
    icon: <Sparkles className="w-6 h-6" />,
    gradient: "from-purple-950/30",
    iconBg: "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20",
  },
  {
    title: "Quick Edit",
    description: "Fast video assembly",
    icon: <Zap className="w-6 h-6" />,
    gradient: "from-pink-950/30",
    iconBg: "bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20",
  },
  {
    title: "Analytics",
    description: "Track your performance",
    icon: <TrendingUp className="w-6 h-6" />,
    gradient: "from-blue-950/30",
    iconBg: "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20",
  },
];

function QuickActionCard({ action }: { action: QuickAction }) {
  return (
    <Card
      className={`border-border/50 bg-gradient-to-br ${action.gradient} to-transparent hover:${action.gradient.replace("/30", "/50")} transition-colors cursor-pointer group`}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${action.iconBg} transition-colors`}
          >
            {action.icon}
          </div>
          <div>
            <h3 className="font-semibold">{action.title}</h3>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {QUICK_ACTIONS.map((action) => (
        <QuickActionCard key={action.title} action={action} />
      ))}
    </div>
  );
}
