import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdminAuth();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all stats in parallel
    const [
      totalAgents,
      activeAgents,
      verifiedAgents,
      newAgentsThisMonth,
      totalListings,
      availableListings,
      featuredListings,
      newListingsThisMonth,
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalInquiries,
      newInquiriesThisWeek,
      totalViews,
      viewsThisWeek,
      recentAgents,
      recentListings,
    ] = await Promise.all([
      // Agent stats
      prisma.agent.count(),
      prisma.agent.count({ where: { isActive: true } }),
      prisma.agent.count({ where: { isVerified: true } }),
      prisma.agent.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      // Listing stats
      prisma.property.count(),
      prisma.property.count({ where: { status: "AVAILABLE" } }),
      prisma.property.count({ where: { isFeatured: true, status: "AVAILABLE" } }),
      prisma.property.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      // User stats
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      // Inquiry stats
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      // View stats
      prisma.propertyView.count(),
      prisma.propertyView.count({ where: { viewedAt: { gte: sevenDaysAgo } } }),
      // Recent activity
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
          agent: {
            select: { name: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
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
        newThisMonth: newListingsThisMonth,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
      },
      inquiries: {
        total: totalInquiries,
        newThisWeek: newInquiriesThisWeek,
      },
      views: {
        total: totalViews,
        thisWeek: viewsThisWeek,
      },
      recent: {
        agents: recentAgents,
        listings: recentListings,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
