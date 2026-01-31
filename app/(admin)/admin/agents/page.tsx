import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentManagementTable } from "@/components/admin/agent-management-table";
import { Users, UserCheck, Clock, UserX } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ filter?: string; search?: string; page?: string }>;
}

async function getAgentStats() {
  const [total, active, verified, pending] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.count({ where: { isActive: true } }),
    prisma.agent.count({ where: { isVerified: true } }),
    prisma.agent.count({ where: { isVerified: false, isActive: true } }),
  ]);

  return { total, active, verified, pending };
}

async function getAgents(filter?: string, search?: string, page = 1) {
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filter === "pending") {
    where.isVerified = false;
    where.isActive = true;
  } else if (filter === "verified") {
    where.isVerified = true;
  } else if (filter === "inactive") {
    where.isActive = false;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { prcLicense: { contains: search, mode: "insensitive" } },
    ];
  }

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        prcLicense: true,
        photo: true,
        isActive: true,
        isVerified: true,
        verifiedAt: true,
        createdAt: true,
        _count: {
          select: { listings: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.agent.count({ where }),
  ]);

  return {
    agents: agents.map((a) => ({
      ...a,
      verifiedAt: a.verifiedAt?.toISOString() || null,
      createdAt: a.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function AdminAgentsPage({ searchParams }: PageProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    redirect("/admin/dashboard");
  }

  const params = await searchParams;
  const filter = params.filter;
  const search = params.search;
  const page = parseInt(params.page || "1");

  const [stats, { agents, pagination }] = await Promise.all([
    getAgentStats(),
    getAgents(filter, search, page),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
        <p className="text-gray-600">Verify and manage registered agents</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Agents
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Verified
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.verified}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
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
              {stats.total - stats.active}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Table */}
      <AgentManagementTable
        agents={agents}
        pagination={pagination}
        currentFilter={filter}
        currentSearch={search}
      />
    </div>
  );
}
