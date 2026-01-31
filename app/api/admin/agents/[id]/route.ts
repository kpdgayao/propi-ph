import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth";
import { updateAgentStatusSchema } from "@/lib/validations";

// GET /api/admin/agents/[id] - Get agent details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
    const { id } = await params;

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        verifiedBy: {
          select: { name: true, email: true },
        },
        listings: {
          select: {
            id: true,
            title: true,
            status: true,
            isFeatured: true,
            isFlagged: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            listings: true,
            receivedInquiries: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ agent });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized" || error.message === "Insufficient permissions") {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
    }
    console.error("Failed to fetch agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/agents/[id] - Update agent status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
    const { id } = await params;
    const body = await request.json();

    const result = updateAgentStatusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (result.data.isActive !== undefined) {
      updateData.isActive = result.data.isActive;
    }

    if (result.data.isVerified !== undefined) {
      updateData.isVerified = result.data.isVerified;
      if (result.data.isVerified) {
        updateData.verifiedAt = new Date();
        updateData.verifiedById = session.adminId;
      } else {
        updateData.verifiedAt = null;
        updateData.verifiedById = null;
      }
    }

    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        isVerified: true,
        verifiedAt: true,
      },
    });

    return NextResponse.json({ agent: updatedAgent });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized" || error.message === "Insufficient permissions") {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
    }
    console.error("Failed to update agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}
