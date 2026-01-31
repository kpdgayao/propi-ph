import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building,
  UserCheck,
  Eye,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Star,
  ArrowRight,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalAgents,
    activeAgents,
    verifiedAgents,
    newAgentsThisMonth,
    totalListings,
    availableListings,
    featuredListings,
    flaggedListings,
    totalUsers,
    newUsersThisMonth,
    totalInquiries,
    newInquiriesThisWeek,
    totalViews,
    recentAgents,
    recentListings,
  ] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.count({ where: { isActive: true } }),
    prisma.agent.count({ where: { isVerified: true } }),
    prisma.agent.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.property.count(),
    prisma.property.count({ where: { status: "AVAILABLE" } }),
    prisma.property.count({ where: { isFeatured: true, status: "AVAILABLE" } }),
    prisma.property.count({ where: { isFlagged: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.propertyView.count(),
    prisma.agent.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.property.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        isFeatured: true,
        isFlagged: true,
        createdAt: true,
        agent: { select: { name: true } },
      },
    }),
  ]);

  return {
    agents: {
      total: totalAgents,
      active: activeAgents,
      verified: verifiedAgents,
      newThisMonth: newAgentsThisMonth,
      pendingVerification: activeAgents - verifiedAgents,
    },
    listings: {
      total: totalListings,
      available: availableListings,
      featured: featuredListings,
      flagged: flaggedListings,
    },
    users: {
      total: totalUsers,
      newThisMonth: newUsersThisMonth,
    },
    inquiries: {
      total: totalInquiries,
      newThisWeek: newInquiriesThisWeek,
    },
    views: {
      total: totalViews,
    },
    recent: {
      agents: recentAgents,
      listings: recentListings,
    },
  };
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Agents
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agents.total}</div>
            <p className="text-xs text-gray-500">
              {stats.agents.active} active, {stats.agents.verified} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Listings
            </CardTitle>
            <Building className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.listings.total}</div>
            <p className="text-xs text-gray-500">
              {stats.listings.available} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Public Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-gray-500">
              +{stats.users.newThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Property Views
            </CardTitle>
            <Eye className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.views.total.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.agents.pendingVerification > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    {stats.agents.pendingVerification} Pending Verification
                  </p>
                  <p className="text-sm text-yellow-700">
                    Agents waiting for approval
                  </p>
                </div>
              </div>
              <Link href="/admin/agents?filter=pending">
                <Button variant="outline" size="sm">
                  Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {stats.listings.flagged > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">
                    {stats.listings.flagged} Flagged Listings
                  </p>
                  <p className="text-sm text-red-700">Require moderation</p>
                </div>
              </div>
              <Link href="/admin/listings?filter=flagged">
                <Button variant="outline" size="sm">
                  Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">
                  {stats.inquiries.newThisWeek} New Inquiries
                </p>
                <p className="text-sm text-blue-700">This week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  {stats.listings.featured} Featured
                </p>
                <p className="text-sm text-green-700">Active featured listings</p>
              </div>
            </div>
            <Link href="/admin/listings?filter=featured">
              <Button variant="outline" size="sm">
                Manage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Agents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Agents</CardTitle>
            <Link href="/admin/agents">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{agent.name}</p>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {agent.isVerified ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        Pending
                      </span>
                    )}
                    {!agent.isActive && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Listings</CardTitle>
            <Link href="/admin/listings">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent.listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 line-clamp-1">
                      {listing.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      by {listing.agent.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {listing.isFlagged && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        Flagged
                      </span>
                    )}
                    {listing.isFeatured && (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        Featured
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        listing.status === "AVAILABLE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
