"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { NAV_ITEMS, ADMIN_NAV_ITEMS, NavItem } from "@/constants";

interface NavLinksProps {
  userRole?: string;
}

function NavLink({ item, layoutId }: { item: NavItem; layoutId: string }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));
  const Icon = item.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
              isActive
                ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full"
              />
            )}
            <Icon
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isActive ? "text-purple-400" : ""
              }`}
            />
            <span className="font-medium">{item.label}</span>
            {isActive && (
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="lg:hidden">
          {item.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function NavLinks({ userRole }: NavLinksProps) {
  const isAdmin = userRole === "super_admin" || userRole === "admin";

  return (
    <>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} layoutId="activeNav" />
        ))}
      </nav>

      {isAdmin && (
        <>
          <div className="h-px bg-border/50 my-3" />
          <div className="px-4 py-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </span>
          </div>
          <nav className="space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} layoutId="activeNavAdmin" />
            ))}
          </nav>
        </>
      )}
    </>
  );
}
