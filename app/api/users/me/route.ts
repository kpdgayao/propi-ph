import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireUserAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        preferredLocations: true,
        preferredTypes: true,
        minBudget: true,
        maxBudget: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            savedSearches: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
