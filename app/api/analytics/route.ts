import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    // Get all properties for this agent
    const properties = await prisma.property.findMany({
      where: { agentId: session.agentId },
      select: {
        id: true,
        title: true,
        viewCount: true,
        status: true,
        photos: true,
        price: true,
        city: true,
        province: true,
      },
    });

    const propertyIds = properties.map((p) => p.id);

    // Get inquiry stats
    const [totalInquiries, newInquiries, convertedInquiries] = await Promise.all([
      prisma.inquiry.count({
        where: { agentId: session.agentId },
      }),
      prisma.inquiry.count({
        where: {
          agentId: session.agentId,
          status: "NEW",
        },
      }),
      prisma.inquiry.count({
        where: {
          agentId: session.agentId,
          status: "CONVERTED",
        },
      }),
    ]);

    // Get inquiries over time
    const inquiriesOverTime = await prisma.inquiry.groupBy({
      by: ["createdAt"],
      where: {
        agentId: session.agentId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    // Aggregate inquiries by day
    const inquiriesByDay: Record<string, number> = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      inquiriesByDay[format(d, "yyyy-MM-dd")] = 0;
    }
    inquiriesOverTime.forEach((item) => {
      const day = format(new Date(item.createdAt), "yyyy-MM-dd");
      if (inquiriesByDay[day] !== undefined) {
        inquiriesByDay[day]++;
      }
    });

    const inquiryTrend = Object.entries(inquiriesByDay).map(([date, count]) => ({
      date,
      inquiries: count,
    }));

    // Get property stats
    const totalViews = properties.reduce((sum, p) => sum + p.viewCount, 0);
    const activeListings = properties.filter((p) => p.status === "AVAILABLE").length;
    const totalListings = properties.length;

    // Get top performing listings
    const topListings = properties
      .filter((p) => p.status === "AVAILABLE")
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        views: p.viewCount,
        photo: p.photos[0] || null,
        price: p.price,
        location: `${p.city}, ${p.province}`,
      }));

    // Get inquiry counts per property
    const inquiriesPerProperty = await prisma.inquiry.groupBy({
      by: ["propertyId"],
      where: {
        propertyId: { in: propertyIds },
      },
      _count: true,
    });

    const inquiryMap: Record<string, number> = {};
    inquiriesPerProperty.forEach((item) => {
      inquiryMap[item.propertyId] = item._count;
    });

    // Add inquiry counts to top listings
    const topListingsWithInquiries = topListings.map((listing) => ({
      ...listing,
      inquiries: inquiryMap[listing.id] || 0,
    }));

    // Calculate conversion rate
    const conversionRate =
      totalInquiries > 0
        ? Math.round((convertedInquiries / totalInquiries) * 100)
        : 0;

    return NextResponse.json({
      overview: {
        totalViews,
        totalInquiries,
        newInquiries,
        activeListings,
        totalListings,
        conversionRate,
      },
      inquiryTrend,
      topListings: topListingsWithInquiries,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
