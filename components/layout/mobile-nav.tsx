"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  PlusCircle,
  MessageSquare,
  User,
  Inbox,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount, UnreadBadge } from "@/components/layout/unread-badge";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/listings/new", label: "Add", icon: PlusCircle },
  { href: "/leads", label: "Leads", icon: Inbox },
  { href: "/messages", label: "Messages", icon: MessageSquare, showBadge: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const unreadCount = useUnreadCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-2",
                isActive ? "text-primary" : "text-gray-500"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5",
                    item.href === "/listings/new" && "h-6 w-6"
                  )}
                />
                {item.showBadge && unreadCount > 0 && (
                  <UnreadBadge
                    count={unreadCount}
                    className="absolute -right-2 -top-1 h-4 min-w-4 text-[10px]"
                  />
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
