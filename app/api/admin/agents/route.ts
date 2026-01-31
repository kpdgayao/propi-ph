import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
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
            select: {
              listings: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.agent.count({ where }),
    ]);

    return NextResponse.json({
      agents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized" || error.message === "Insufficient permissions") {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
    }
    console.error("Failed to fetch agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
