"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadCount, UnreadBadge } from "@/components/layout/unread-badge";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Plus,
  MessageSquare,
} from "lucide-react";

interface HeaderProps {
  user: {
    name: string;
    email: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/listings", label: "My Listings" },
  { href: "/discover", label: "Discover" },
  { href: "/leads", label: "Leads" },
  { href: "/analytics", label: "Analytics" },
];

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const unreadCount = useUnreadCount();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo and Nav */}
        <div className="flex items-center gap-8">
          <BrandLogo href="/dashboard" size="md" />
          <nav className="hidden md:flex md:gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Messages with Badge */}
          <Link
            href="/messages"
            className={cn(
              "relative hidden rounded-md p-2 transition-colors md:block",
              pathname.startsWith("/messages")
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <MessageSquare className="h-5 w-5" />
            {unreadCount > 0 && (
              <UnreadBadge
                count={unreadCount}
                className="absolute -right-1 -top-1"
              />
            )}
          </Link>

          <Link href="/listings/new" className="hidden md:block">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Listing
            </Button>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm font-medium text-gray-700 md:inline-block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
