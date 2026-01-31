import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth";
import { updateAdminSchema } from "@/lib/validations";

// GET /api/admin/admins/[id] - Get admin details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminRole(["SUPER_ADMIN"]);
    const { id } = await params;

    const admin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            verifiedAgents: true,
            moderatedListings: true,
          },
        },
      },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      admin: {
        ...admin,
        lastLoginAt: admin.lastLoginAt?.toISOString() || null,
        createdAt: admin.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Failed to fetch admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/admins/[id] - Update admin
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminRole(["SUPER_ADMIN"]);
    const { id } = await params;
    const body = await request.json();

    const result = updateAdminSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Prevent self-demotion from SUPER_ADMIN
    if (
      id === session.adminId &&
      result.data.role &&
      result.data.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "You cannot demote yourself from SUPER_ADMIN" },
        { status: 400 }
      );
    }

    // Prevent self-deactivation
    if (id === session.adminId && result.data.isActive === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (result.data.name !== undefined) {
      updateData.name = result.data.name;
    }
    if (result.data.role !== undefined) {
      updateData.role = result.data.role;
    }
    if (result.data.isActive !== undefined) {
      updateData.isActive = result.data.isActive;
    }
    if (result.data.password) {
      updateData.passwordHash = await hash(result.data.password, 12);
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: "Admin updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Failed to update admin:", error);
    return NextResponse.json(
      { error: "Failed to update admin" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/admins/[id] - Delete admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminRole(["SUPER_ADMIN"]);
    const { id } = await params;

    // Prevent self-deletion
    if (id === session.adminId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Admin deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Failed to delete admin:", error);
    return NextResponse.json(
      { error: "Failed to delete admin" },
      { status: 500 }
    );
  }
}
