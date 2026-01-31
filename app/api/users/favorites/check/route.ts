import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOptionalUserSession } from "@/lib/auth";

// GET /api/users/favorites/check?propertyId=xxx - Check if property is favorited
export async function GET(request: NextRequest) {
  try {
    const session = await getOptionalUserSession();

    if (!session) {
      return NextResponse.json({ isFavorited: false, isLoggedIn: false });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: session.userId,
          propertyId,
        },
      },
    });

    return NextResponse.json({
      isFavorited: !!favorite,
      isLoggedIn: true,
    });
  } catch (error) {
    console.error("Failed to check favorite:", error);
    return NextResponse.json({ isFavorited: false, isLoggedIn: false });
  }
}
