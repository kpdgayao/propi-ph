"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building,
  Shield,
  Settings,
  BarChart3,
  Menu,
} from "lucide-react";
import type { AdminRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

interface AdminSidebarProps {
  role: AdminRole;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  },
  {
    name: "Agents",
    href: "/admin/agents",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Listings",
    href: "/admin/listings",
    icon: Building,
    roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Admins",
    href: "/admin/admins",
    icon: Shield,
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  },
];

function NavContent({ role, onNavigate }: { role: AdminRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const filteredNav = navigation.filter((item) => item.roles.includes(role));

  return (
    <nav className="space-y-1">
      {filteredNav.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

// Mobile trigger button for use in header
export function AdminMobileNav({ role }: AdminSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle asChild>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Propi Admin</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <NavContent role={role} onNavigate={() => setOpen(false)} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">Role</p>
            <p className="text-sm font-semibold text-gray-900">
              {role.replace("_", " ")}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Desktop sidebar
export function AdminSidebar({ role }: AdminSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-gray-200 bg-white lg:block">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <span className="text-lg font-bold text-gray-900">Propi</span>
            <span className="ml-1 text-xs font-medium text-gray-500">Admin</span>
          </div>
        </Link>
      </div>

      <div className="p-4">
        <NavContent role={role} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500">Role</p>
          <p className="text-sm font-semibold text-gray-900">
            {role.replace("_", " ")}
          </p>
        </div>
      </div>
    </aside>
  );
}
