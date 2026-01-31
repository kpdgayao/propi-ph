import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth";
import { moderateListingSchema } from "@/lib/validations";

// GET /api/admin/listings/[id] - Get listing details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
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
            isVerified: true,
          },
        },
        moderatedBy: {
          select: { name: true, email: true },
        },
        _count: {
          select: {
            inquiries: true,
            views: true,
            favorites: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({
      listing: {
        ...listing,
        price: Number(listing.price),
        lotArea: listing.lotArea ? Number(listing.lotArea) : null,
        floorArea: listing.floorArea ? Number(listing.floorArea) : null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to fetch listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/listings/[id] - Moderate listing
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth();
    const { id } = await params;
    const body = await request.json();

    const result = moderateListingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const listing = await prisma.property.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      moderatedAt: new Date(),
      moderatedById: session.adminId,
    };

    if (result.data.isFeatured !== undefined) {
      updateData.isFeatured = result.data.isFeatured;
    }

    if (result.data.isFlagged !== undefined) {
      updateData.isFlagged = result.data.isFlagged;
      if (result.data.isFlagged) {
        updateData.flagReason = result.data.flagReason || null;
      } else {
        updateData.flagReason = null;
      }
    }

    if (result.data.status) {
      updateData.status = result.data.status;
    }

    const updatedListing = await prisma.property.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        status: true,
        isFeatured: true,
        isFlagged: true,
        flagReason: true,
        moderatedAt: true,
      },
    });

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to moderate listing:", error);
    return NextResponse.json(
      { error: "Failed to moderate listing" },
      { status: 500 }
    );
  }
}
