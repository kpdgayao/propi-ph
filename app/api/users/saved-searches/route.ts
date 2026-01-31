import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserAuth } from "@/lib/auth";
import { savedSearchSchema } from "@/lib/validations";

// GET /api/users/saved-searches - List user's saved searches
export async function GET() {
  try {
    const session = await requireUserAuth();

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ savedSearches });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to fetch saved searches:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved searches" },
      { status: 500 }
    );
  }
}

// POST /api/users/saved-searches - Create a new saved search
export async function POST(request: NextRequest) {
  try {
    const session = await requireUserAuth();
    const body = await request.json();

    const result = savedSearchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, query, alertsOn } = result.data;

    // Check if user already has too many saved searches (limit to 10)
    const existingCount = await prisma.savedSearch.count({
      where: { userId: session.userId },
    });

    if (existingCount >= 10) {
      return NextResponse.json(
        { error: "Maximum of 10 saved searches allowed" },
        { status: 400 }
      );
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.userId,
        name,
        query,
        alertsOn,
      },
    });

    return NextResponse.json({ savedSearch }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to create saved search:", error);
    return NextResponse.json(
      { error: "Failed to create saved search" },
      { status: 500 }
    );
  }
}
