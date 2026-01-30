import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// text-embedding-3-small produces 1536-dimensional vectors
const EMBEDDING_MODEL = "text-embedding-3-small";

export interface PropertyEmbeddingInput {
  title: string;
  description?: string;
  propertyType: string;
  transactionType: string;
  province: string;
  city: string;
  barangay?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  features?: string[];
}

/**
 * Creates a text representation of a property for embedding
 */
export function propertyToEmbeddingText(property: PropertyEmbeddingInput): string {
  const parts: string[] = [];

  // Property type and transaction
  const propertyTypeLabels: Record<string, string> = {
    HOUSE: "house",
    CONDO: "condominium condo",
    TOWNHOUSE: "townhouse",
    APARTMENT: "apartment",
    LOT: "lot land vacant",
    COMMERCIAL: "commercial office retail",
    WAREHOUSE: "warehouse industrial",
    FARM: "farm agricultural land",
  };

  parts.push(
    `${propertyTypeLabels[property.propertyType] || property.propertyType} for ${
      property.transactionType === "SALE" ? "sale buy purchase" : "rent lease"
    }`
  );

  // Title and description
  parts.push(property.title);
  if (property.description) {
    parts.push(property.description);
  }

  // Location with variations
  const location = [property.barangay, property.city, property.province]
    .filter(Boolean)
    .join(" ");
  parts.push(location);

  // Specifications
  if (property.bedrooms) {
    parts.push(`${property.bedrooms} bedroom${property.bedrooms > 1 ? "s" : ""} ${property.bedrooms}BR`);
  }
  if (property.bathrooms) {
    parts.push(`${property.bathrooms} bathroom${property.bathrooms > 1 ? "s" : ""} ${property.bathrooms}T&B`);
  }

  // Features
  if (property.features && property.features.length > 0) {
    parts.push(property.features.join(" "));
  }

  return parts.join(" ").toLowerCase();
}

/**
 * Generate embedding for a property listing
 */
export async function generatePropertyEmbedding(
  property: PropertyEmbeddingInput
): Promise<number[]> {
  const text = propertyToEmbeddingText(property);

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

/**
 * Generate embedding for a search query
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query.toLowerCase(),
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

export default openai;
