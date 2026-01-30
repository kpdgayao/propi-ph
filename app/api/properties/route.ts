import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PropertyType, TransactionType, Prisma } from "@prisma/client";

// GET /api/properties - Public listings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filters
    const propertyType = searchParams.get("propertyType") as PropertyType | null;
    const transactionType = searchParams.get("transactionType") as TransactionType | null;
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const province = searchParams.get("province");
    const city = searchParams.get("city");
    const bedrooms = searchParams.get("bedrooms");
    const bathrooms = searchParams.get("bathrooms");
    const bedroomsMin = searchParams.get("bedroomsMin");
    const bedroomsMax = searchParams.get("bedroomsMax");

    // Sort
    const sortBy = searchParams.get("sortBy") || "newest";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause - only show AVAILABLE listings
    const where: Prisma.PropertyWhereInput = {
      status: "AVAILABLE",
    };

    if (propertyType) {
      where.propertyType = propertyType;
    }

    if (transactionType) {
      where.transactionType = transactionType;
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) {
        where.price.gte = parseFloat(priceMin);
      }
      if (priceMax) {
        where.price.lte = parseFloat(priceMax);
      }
    }

    if (province) {
      where.province = {
        contains: province,
        mode: "insensitive",
      };
    }

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    if (bedrooms) {
      where.bedrooms = parseInt(bedrooms);
    } else if (bedroomsMin || bedroomsMax) {
      where.bedrooms = {};
      if (bedroomsMin) {
        where.bedrooms.gte = parseInt(bedroomsMin);
      }
      if (bedroomsMax) {
        where.bedrooms.lte = parseInt(bedroomsMax);
      }
    }

    if (bathrooms) {
      where.bathrooms = parseInt(bathrooms);
    }

    // Build orderBy
    let orderBy: Prisma.PropertyOrderByWithRelationInput = { publishedAt: "desc" };

    switch (sortBy) {
      case "newest":
        orderBy = { publishedAt: sortOrder as Prisma.SortOrder };
        break;
      case "price":
        orderBy = { price: sortOrder as Prisma.SortOrder };
        break;
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "views":
        orderBy = { viewCount: sortOrder as Prisma.SortOrder };
        break;
    }

    // Query
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
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
          barangay: true,
          bedrooms: true,
          bathrooms: true,
          carpark: true,
          lotArea: true,
          floorArea: true,
          photos: true,
          features: true,
          allowCoBroke: true,
          coBrokeSplit: true,
          viewCount: true,
          publishedAt: true,
          agent: {
            select: {
              id: true,
              name: true,
              photo: true,
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        propertyType,
        transactionType,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        province,
        city,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
      },
    });
  } catch (error) {
    console.error("List properties error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
