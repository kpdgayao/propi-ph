import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAdminAuth();

    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to fetch admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin" },
      { status: 500 }
    );
  }
}
