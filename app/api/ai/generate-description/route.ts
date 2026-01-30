import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateListingDescription, PropertyDetails } from "@/lib/claude";
import { z } from "zod";

const requestSchema = z.object({
  propertyType: z.string().min(1),
  transactionType: z.string().min(1),
  price: z.number().positive(),
  province: z.string().min(1),
  city: z.string().min(1),
  barangay: z.string().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  carpark: z.number().int().min(0).optional(),
  lotArea: z.number().positive().optional(),
  floorArea: z.number().positive().optional(),
  floors: z.number().int().min(1).optional(),
  yearBuilt: z.number().int().optional(),
  features: z.array(z.string()).optional(),
  furnishing: z.string().optional(),
  landmark: z.string().optional(),
});

// POST /api/ai/generate-description
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth();

    const body = await request.json();
    const data = requestSchema.parse(body);

    // Check if we have minimum required data
    if (!data.propertyType || !data.transactionType || !data.price) {
      return NextResponse.json(
        { error: "Property type, transaction type, and price are required" },
        { status: 400 }
      );
    }

    const description = await generateListingDescription(data as PropertyDetails);

    return NextResponse.json({
      description,
      message: "Description generated successfully",
    });
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

    console.error("Generate description error:", error);
    return NextResponse.json(
      { error: "Failed to generate description. Please try again." },
      { status: 500 }
    );
  }
}
