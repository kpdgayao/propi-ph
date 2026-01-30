import { NextRequest, NextResponse } from "next/server";
import { semanticSearch, SearchFilters } from "@/lib/vector-search";
import { PropertyType, TransactionType } from "@prisma/client";

// GET /api/search - Semantic search for properties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || searchParams.get("query");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = (page - 1) * limit;

    // Build filters
    const filters: SearchFilters = {};

    const propertyType = searchParams.get("propertyType");
    if (propertyType && Object.values(PropertyType).includes(propertyType as PropertyType)) {
      filters.propertyType = propertyType as PropertyType;
    }

    const transactionType = searchParams.get("transactionType");
    if (transactionType && Object.values(TransactionType).includes(transactionType as TransactionType)) {
      filters.transactionType = transactionType as TransactionType;
    }

    const priceMin = searchParams.get("priceMin");
    if (priceMin) {
      filters.priceMin = parseFloat(priceMin);
    }

    const priceMax = searchParams.get("priceMax");
    if (priceMax) {
      filters.priceMax = parseFloat(priceMax);
    }

    const province = searchParams.get("province");
    if (province) {
      filters.province = province;
    }

    const city = searchParams.get("city");
    if (city) {
      filters.city = city;
    }

    const bedroomsMin = searchParams.get("bedroomsMin");
    if (bedroomsMin) {
      filters.bedroomsMin = parseInt(bedroomsMin);
    }

    const bedroomsMax = searchParams.get("bedroomsMax");
    if (bedroomsMax) {
      filters.bedroomsMax = parseInt(bedroomsMax);
    }

    const bathroomsMin = searchParams.get("bathroomsMin");
    if (bathroomsMin) {
      filters.bathroomsMin = parseInt(bathroomsMin);
    }

    const bathroomsMax = searchParams.get("bathroomsMax");
    if (bathroomsMax) {
      filters.bathroomsMax = parseInt(bathroomsMax);
    }

    // Perform semantic search
    const { results, total } = await semanticSearch(query, filters, limit, offset);

    return NextResponse.json({
      properties: results,
      query,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        propertyType: filters.propertyType || null,
        transactionType: filters.transactionType || null,
        priceMin: filters.priceMin || null,
        priceMax: filters.priceMax || null,
        province: filters.province || null,
        city: filters.city || null,
        bedroomsMin: filters.bedroomsMin || null,
        bedroomsMax: filters.bedroomsMax || null,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}
