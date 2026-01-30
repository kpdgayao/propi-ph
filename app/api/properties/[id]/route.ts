import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/properties/[id] - Get single property (public)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photo: true,
            bio: true,
            prcLicense: true,
            areasServed: true,
            specializations: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Only show available properties publicly
    if (property.status !== "AVAILABLE") {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment view count (fire and forget)
    prisma.property
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => console.error("Failed to increment view count:", err));

    // Remove sensitive fields
    const publicProperty = {
      ...property,
      address: undefined, // Hide full address until inquiry
    };

    return NextResponse.json({ property: publicProperty });
  } catch (error) {
    console.error("Get property error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
