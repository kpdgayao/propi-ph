import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { updateListingSchema } from "@/lib/validations";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/listings/[id] - Get single listing
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const listing = await prisma.property.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photo: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Only owner can view draft/unlisted listings
    if (
      listing.agentId !== session.agentId &&
      (listing.status === "DRAFT" || listing.status === "UNLISTED")
    ) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Get listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[id] - Update listing
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const data = updateListingSchema.parse(body);

    // Check ownership
    const existing = await prisma.property.findUnique({
      where: { id },
      select: { agentId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.agentId !== session.agentId) {
      return NextResponse.json(
        { error: "You can only edit your own listings" },
        { status: 403 }
      );
    }

    // Calculate price per sqm if relevant fields changed
    let pricePerSqm = undefined;
    if (data.price !== undefined || data.floorArea !== undefined) {
      const price = data.price;
      const floorArea = data.floorArea;
      if (price && floorArea) {
        pricePerSqm = Number(price) / Number(floorArea);
      }
    }

    const listing = await prisma.property.update({
      where: { id },
      data: {
        ...data,
        ...(pricePerSqm !== undefined && { pricePerSqm }),
      },
    });

    return NextResponse.json({
      message: "Listing updated successfully",
      listing,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Update listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - Delete listing
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Check ownership
    const existing = await prisma.property.findUnique({
      where: { id },
      select: { agentId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.agentId !== session.agentId) {
      return NextResponse.json(
        { error: "You can only delete your own listings" },
        { status: 403 }
      );
    }

    // Prevent deletion of sold/rented properties (keep for records)
    if (existing.status === "SOLD" || existing.status === "RENTED") {
      return NextResponse.json(
        { error: "Cannot delete sold or rented properties" },
        { status: 400 }
      );
    }

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Listing deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Delete listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
