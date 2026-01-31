"use client";

import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Film, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NavLinks } from "./nav-links";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  userRole?: string;
}

export function Sidebar({ user, userRole }: SidebarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ReelMaker
          </span>
          <span className="text-xs text-muted-foreground">AI Video Studio</span>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Quick Create Button */}
      <div className="p-4">
        <Link href="/dashboard/projects/new">
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 group">
            <Plus className="w-4 h-4 mr-2" />
            <span>New Project</span>
            <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <NavLinks userRole={userRole} />

        {/* Pro Card */}
        <div className="mt-6 mx-1">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-4 border border-purple-500/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 mb-3">
              Pro
            </Badge>
            <h4 className="font-semibold text-sm mb-1">Upgrade to Pro</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock unlimited projects & advanced AI features
            </p>
            <Button size="sm" variant="secondary" className="w-full text-xs">
              Upgrade Now
            </Button>
          </div>
        </div>
      </ScrollArea>

      <Separator className="opacity-50" />

      {/* User section */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-6 h-auto hover:bg-muted rounded-xl"
            >
              <Avatar className="w-9 h-9 mr-3 ring-2 ring-purple-500/30">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
