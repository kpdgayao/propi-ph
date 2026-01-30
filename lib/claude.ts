import Anthropic from "@anthropic-ai/sdk";

// Lazy initialization to avoid build-time errors
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

export interface PropertyDetails {
  propertyType: string;
  transactionType: string;
  price: number;
  province: string;
  city: string;
  barangay?: string;
  bedrooms?: number;
  bathrooms?: number;
  carpark?: number;
  lotArea?: number;
  floorArea?: number;
  floors?: number;
  yearBuilt?: number;
  features?: string[];
  furnishing?: string;
  landmark?: string;
}

export async function generateListingDescription(
  details: PropertyDetails
): Promise<string> {
  const {
    propertyType,
    transactionType,
    price,
    province,
    city,
    barangay,
    bedrooms,
    bathrooms,
    carpark,
    lotArea,
    floorArea,
    floors,
    yearBuilt,
    features,
    furnishing,
    landmark,
  } = details;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(p);

  const propertyTypeLabels: Record<string, string> = {
    HOUSE: "House",
    CONDO: "Condominium",
    TOWNHOUSE: "Townhouse",
    APARTMENT: "Apartment",
    LOT: "Lot/Land",
    COMMERCIAL: "Commercial Property",
    WAREHOUSE: "Warehouse",
    FARM: "Farm/Agricultural Land",
  };

  const furnishingLabels: Record<string, string> = {
    UNFURNISHED: "unfurnished",
    SEMI_FURNISHED: "semi-furnished",
    FULLY_FURNISHED: "fully furnished",
  };

  const prompt = `You are a Filipino real estate copywriter specializing in Northern Luzon properties. Write a compelling property listing description.

Property Details:
- Type: ${propertyTypeLabels[propertyType] || propertyType} for ${transactionType === "SALE" ? "Sale" : "Rent"}
- Location: ${barangay ? barangay + ", " : ""}${city}, ${province}
- Price: ${formatPrice(price)}${transactionType === "RENT" ? "/month" : ""}
${lotArea ? `- Lot Area: ${lotArea} sqm` : ""}
${floorArea ? `- Floor Area: ${floorArea} sqm` : ""}
${bedrooms ? `- Bedrooms: ${bedrooms}` : ""}
${bathrooms ? `- Bathrooms: ${bathrooms}` : ""}
${carpark ? `- Parking: ${carpark} car${carpark > 1 ? "s" : ""}` : ""}
${floors ? `- Floors: ${floors}` : ""}
${yearBuilt ? `- Year Built: ${yearBuilt}` : ""}
${furnishing ? `- Furnishing: ${furnishingLabels[furnishing] || furnishing}` : ""}
${features && features.length > 0 ? `- Features: ${features.join(", ")}` : ""}
${landmark ? `- Nearby: ${landmark}` : ""}

Requirements:
1. Write in warm, professional English
2. Start with an engaging opening that captures attention
3. Highlight the best features and location advantages specific to ${city}
4. Mention lifestyle benefits and investment potential where relevant
5. Keep it 150-200 words
6. Do NOT include the price in the description (it's shown separately)
7. Do NOT use clichéd phrases like "Don't miss this opportunity" or "Act now"
8. End with a subtle invitation to inquire or schedule a viewing

Return ONLY the description text, no titles, labels, or quotation marks.`;

  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === "text") {
    return content.text.trim();
  }

  throw new Error("Unexpected response format from Claude");
}
