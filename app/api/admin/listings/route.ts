import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filter === "flagged") {
      where.isFlagged = true;
    } else if (filter === "featured") {
      where.isFeatured = true;
      where.status = "AVAILABLE";
    } else if (filter === "available") {
      where.status = "AVAILABLE";
    } else if (filter === "draft") {
      where.status = "DRAFT";
    } else if (filter === "unlisted") {
      where.status = "UNLISTED";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { agent: { name: { contains: search, mode: "insensitive" } } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.property.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          isFeatured: true,
          isFlagged: true,
          flagReason: true,
          price: true,
          city: true,
          province: true,
          photos: true,
          viewCount: true,
          createdAt: true,
          agent: {
            select: {
              id: true,
              name: true,
              isVerified: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      listings: listings.map((l) => ({
        ...l,
        price: Number(l.price),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to fetch listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
