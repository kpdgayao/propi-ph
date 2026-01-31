import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserAuth, getOptionalUserSession } from "@/lib/auth";
import { z } from "zod";

const favoriteSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
});

// GET /api/users/favorites - List user's favorites
export async function GET() {
  try {
    const session = await requireUserAuth();

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.userId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            transactionType: true,
            propertyType: true,
            city: true,
            province: true,
            bedrooms: true,
            bathrooms: true,
            floorArea: true,
            photos: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter out properties that are no longer available
    const availableFavorites = favorites.filter(
      (fav) => fav.property.status === "AVAILABLE"
    );

    return NextResponse.json({
      favorites: availableFavorites.map((fav) => ({
        id: fav.id,
        propertyId: fav.propertyId,
        createdAt: fav.createdAt,
        property: fav.property,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to fetch favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST /api/users/favorites - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await requireUserAuth();
    const body = await request.json();

    const result = favoriteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { propertyId } = result.data;

    // Check if property exists and is available
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, status: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Property is not available" },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: session.userId,
          propertyId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Property already in favorites" },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.userId,
        propertyId,
      },
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to add favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/favorites - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireUserAuth();
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

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to remove favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
