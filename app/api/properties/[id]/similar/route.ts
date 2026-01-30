import { NextRequest, NextResponse } from "next/server";
import { findSimilarProperties } from "@/lib/vector-search";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/properties/[id]/similar - Get similar properties
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6"), 12);

    const similarProperties = await findSimilarProperties(id, limit);

    return NextResponse.json({
      properties: similarProperties,
    });
  } catch (error) {
    console.error("Find similar properties error:", error);
    return NextResponse.json(
      { error: "Failed to find similar properties" },
      { status: 500 }
    );
  }
}
