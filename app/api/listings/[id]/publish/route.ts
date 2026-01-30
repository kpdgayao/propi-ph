import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/listings/[id]/publish - Publish a listing
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Check ownership and current status
    const existing = await prisma.property.findUnique({
      where: { id },
      select: {
        agentId: true,
        status: true,
        title: true,
        description: true,
        photos: true,
        price: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.agentId !== session.agentId) {
      return NextResponse.json(
        { error: "You can only publish your own listings" },
        { status: 403 }
      );
    }

    // Can only publish from DRAFT or UNLISTED status
    if (existing.status !== "DRAFT" && existing.status !== "UNLISTED") {
      return NextResponse.json(
        { error: `Cannot publish a listing with status: ${existing.status}` },
        { status: 400 }
      );
    }

    // Validate listing has minimum required fields
    const errors: string[] = [];
    if (!existing.title || existing.title.length < 10) {
      errors.push("Title must be at least 10 characters");
    }
    if (!existing.description || existing.description.length < 50) {
      errors.push("Description must be at least 50 characters");
    }
    if (!existing.price || Number(existing.price) <= 0) {
      errors.push("Price must be set");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Listing is incomplete", details: errors },
        { status: 400 }
      );
    }

    const listing = await prisma.property.update({
      where: { id },
      data: {
        status: "AVAILABLE",
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Listing published successfully",
      listing,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Publish listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
