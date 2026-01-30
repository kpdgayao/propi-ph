import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateListingDescription, PropertyDetails } from "@/lib/claude";
import { z } from "zod";

// Helper to coerce string/number to number
const numericString = z.union([z.string(), z.number()]).transform((val) => {
  const num = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(num) ? undefined : num;
});

const optionalNumeric = numericString.optional().transform((val) =>
  val === undefined || val === null || (typeof val === 'number' && isNaN(val)) ? undefined : val
);

const requestSchema = z.object({
  propertyType: z.string().min(1),
  transactionType: z.string().min(1),
  price: numericString,
  province: z.string().min(1),
  city: z.string().min(1),
  barangay: z.string().optional().nullable(),
  bedrooms: optionalNumeric,
  bathrooms: optionalNumeric,
  carpark: optionalNumeric,
  lotArea: optionalNumeric,
  floorArea: optionalNumeric,
  floors: optionalNumeric,
  yearBuilt: optionalNumeric,
  features: z.array(z.string()).optional().nullable(),
  furnishing: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
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

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error("Generate description error:", errorMessage, errorDetails);

    return NextResponse.json(
      {
        error: "Failed to generate description. Please try again.",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
