import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/listings/[id]/unlist - Unlist a property (make it invisible)
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
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.agentId !== session.agentId) {
      return NextResponse.json(
        { error: "You can only unlist your own listings" },
        { status: 403 }
      );
    }

    // Can only unlist from AVAILABLE or RESERVED status
    if (existing.status !== "AVAILABLE" && existing.status !== "RESERVED") {
      return NextResponse.json(
        { error: `Cannot unlist a listing with status: ${existing.status}` },
        { status: 400 }
      );
    }

    const listing = await prisma.property.update({
      where: { id },
      data: {
        status: "UNLISTED",
      },
    });

    return NextResponse.json({
      message: "Listing unlisted successfully",
      listing,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Unlist listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
