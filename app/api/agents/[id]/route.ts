import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const agent = await prisma.agent.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        photo: true,
        bio: true,
        headline: true,
        yearsExperience: true,
        socialLinks: true,
        areasServed: true,
        specializations: true,
        prcLicense: true,
        createdAt: true,
        listings: {
          where: { status: "AVAILABLE" },
          select: {
            id: true,
            title: true,
            price: true,
            propertyType: true,
            transactionType: true,
            city: true,
            province: true,
            bedrooms: true,
            bathrooms: true,
            floorArea: true,
            photos: true,
            viewCount: true,
          },
          orderBy: { createdAt: "desc" },
          take: 12,
        },
        _count: {
          select: {
            listings: {
              where: { status: "AVAILABLE" },
            },
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}
