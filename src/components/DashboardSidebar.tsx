"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Star,
  Globe,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Мои медитации", icon: MessageSquare },
  { href: "/dashboard/public", label: "Публичные", icon: Globe },
  { href: "/dashboard/favorites", label: "Избранное", icon: Star },
  { href: "/dashboard/history", label: "История", icon: History },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[280px] border-r border-border bg-sidebar dark:bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-sidebar-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <MessageSquare className="h-6 w-6" />
            <span>ProMedit</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>
    </aside>
  );
}
