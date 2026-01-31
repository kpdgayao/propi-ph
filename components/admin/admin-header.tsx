"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { AdminJWTPayload } from "@/lib/auth";

interface AdminHeaderProps {
  admin: AdminJWTPayload;
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Admin Portal</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{admin.name}</p>
          <p className="text-xs text-gray-500">{admin.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
