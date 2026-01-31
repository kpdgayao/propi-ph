import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminManagementTable } from "@/components/admin/admin-management-table";
import { Shield, UserCheck, UserX } from "lucide-react";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  const [total, active, superAdmins] = await Promise.all([
    prisma.admin.count(),
    prisma.admin.count({ where: { isActive: true } }),
    prisma.admin.count({ where: { role: "SUPER_ADMIN" } }),
  ]);

  return { total, active, inactive: total - active, superAdmins };
}

async function getAdmins() {
  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      _count: {
        select: {
          verifiedAgents: true,
          moderatedListings: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return admins.map((a) => ({
    ...a,
    lastLoginAt: a.lastLoginAt?.toISOString() || null,
    createdAt: a.createdAt.toISOString(),
  }));
}

export default async function AdminsPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const [stats, admins] = await Promise.all([getAdminStats(), getAdmins()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-gray-600">Manage platform administrators</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Admins
            </CardTitle>
            <Shield className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Inactive
            </CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Super Admins
            </CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.superAdmins}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Table */}
      <AdminManagementTable admins={admins} currentAdminId={session.adminId} />
    </div>
  );
}
