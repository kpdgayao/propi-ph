import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserAuth } from "@/lib/auth";
import { z } from "zod";

const updateSavedSearchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  alertsOn: z.boolean().optional(),
});

// GET /api/users/saved-searches/[id] - Get a specific saved search
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUserAuth();
    const { id } = await params;

    const savedSearch = await prisma.savedSearch.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!savedSearch) {
      return NextResponse.json(
        { error: "Saved search not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ savedSearch });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to fetch saved search:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved search" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/saved-searches/[id] - Update a saved search
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUserAuth();
    const { id } = await params;
    const body = await request.json();

    const result = updateSavedSearchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingSearch = await prisma.savedSearch.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingSearch) {
      return NextResponse.json(
        { error: "Saved search not found" },
        { status: 404 }
      );
    }

    const savedSearch = await prisma.savedSearch.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ savedSearch });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to update saved search:", error);
    return NextResponse.json(
      { error: "Failed to update saved search" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/saved-searches/[id] - Delete a saved search
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUserAuth();
    const { id } = await params;

    // Verify ownership
    const existingSearch = await prisma.savedSearch.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingSearch) {
      return NextResponse.json(
        { error: "Saved search not found" },
        { status: 404 }
      );
    }

    await prisma.savedSearch.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Saved search deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to delete saved search:", error);
    return NextResponse.json(
      { error: "Failed to delete saved search" },
      { status: 500 }
    );
  }
}
