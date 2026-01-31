import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get("area");
    const specialization = searchParams.get("specialization");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (area) {
      where.areasServed = { has: area };
    }

    if (specialization) {
      where.specializations = { has: specialization };
    }

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        select: {
          id: true,
          name: true,
          photo: true,
          headline: true,
          bio: true,
          areasServed: true,
          specializations: true,
          yearsExperience: true,
          _count: {
            select: {
              listings: {
                where: { status: "AVAILABLE" },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.agent.count({ where }),
    ]);

    return NextResponse.json({
      agents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
