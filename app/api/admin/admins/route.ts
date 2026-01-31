import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth";
import { createAdminSchema } from "@/lib/validations";

// GET /api/admin/admins - List all admins (SUPER_ADMIN only)
export async function GET() {
  try {
    const session = await requireAdminRole(["SUPER_ADMIN"]);

    const admins = await prisma.admin.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      admins: admins.map((a) => ({
        ...a,
        lastLoginAt: a.lastLoginAt?.toISOString() || null,
        createdAt: a.createdAt.toISOString(),
        isSelf: a.id === session.adminId,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Failed to fetch admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

// POST /api/admin/admins - Create new admin (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    await requireAdminRole(["SUPER_ADMIN"]);

    const body = await request.json();
    const result = createAdminSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, role } = result.data;

    // Check if email already exists
    const existing = await prisma.admin.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An admin with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Admin created successfully",
      admin: {
        ...admin,
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
    console.error("Failed to create admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    );
  }
}
