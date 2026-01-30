import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createListingSchema } from "@/lib/validations";
import { z } from "zod";
import { PropertyStatus } from "@prisma/client";

// GET /api/listings - List current agent's listings
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as PropertyStatus | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      agentId: session.agentId,
      ...(status && { status }),
    };

    const [listings, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          propertyType: true,
          transactionType: true,
          price: true,
          province: true,
          city: true,
          bedrooms: true,
          bathrooms: true,
          lotArea: true,
          floorArea: true,
          photos: true,
          status: true,
          viewCount: true,
          createdAt: true,
          publishedAt: true,
        },
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("List listings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create new listing
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = createListingSchema.parse(body);

    // Calculate price per sqm if floor area is provided
    const pricePerSqm = data.floorArea
      ? Number(data.price) / Number(data.floorArea)
      : null;

    const listing = await prisma.property.create({
      data: {
        agentId: session.agentId,
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        transactionType: data.transactionType,
        price: data.price,
        pricePerSqm,
        province: data.province,
        city: data.city,
        barangay: data.barangay,
        address: data.address,
        landmark: data.landmark,
        latitude: data.latitude,
        longitude: data.longitude,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        carpark: data.carpark,
        lotArea: data.lotArea,
        floorArea: data.floorArea,
        floors: data.floors,
        yearBuilt: data.yearBuilt,
        features: data.features,
        furnishing: data.furnishing,
        allowCoBroke: data.allowCoBroke,
        coBrokeSplit: data.coBrokeSplit,
        photos: [],
        status: "DRAFT",
      },
    });

    return NextResponse.json(
      {
        message: "Listing created successfully",
        listing,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
