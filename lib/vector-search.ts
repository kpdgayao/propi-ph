import { prisma } from "@/lib/db";
import { generateQueryEmbedding, generatePropertyEmbedding, PropertyEmbeddingInput } from "@/lib/embeddings";
import { PropertyType, TransactionType, Prisma } from "@prisma/client";

export interface SearchFilters {
  propertyType?: PropertyType;
  transactionType?: TransactionType;
  priceMin?: number;
  priceMax?: number;
  province?: string;
  city?: string;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  bathroomsMax?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  price: Prisma.Decimal;
  province: string;
  city: string;
  barangay: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  carpark: number | null;
  lotArea: Prisma.Decimal | null;
  floorArea: Prisma.Decimal | null;
  photos: string[];
  features: string[];
  allowCoBroke: boolean;
  coBrokeSplit: Prisma.Decimal;
  viewCount: number;
  publishedAt: Date | null;
  similarity: number;
  agent: {
    id: string;
    name: string;
    photo: string | null;
  };
}

/**
 * Semantic search for properties using pgvector
 */
export async function semanticSearch(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20,
  offset: number = 0
): Promise<{ results: SearchResult[]; total: number }> {
  // Generate embedding for the search query
  const queryEmbedding = await generateQueryEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  // Build filter conditions
  const conditions: string[] = [`p."status" = 'AVAILABLE'`, `p."embedding" IS NOT NULL`];
  const params: (string | number)[] = [embeddingStr];
  let paramIndex = 2;

  if (filters.propertyType) {
    conditions.push(`p."propertyType" = $${paramIndex}::"PropertyType"`);
    params.push(filters.propertyType);
    paramIndex++;
  }

  if (filters.transactionType) {
    conditions.push(`p."transactionType" = $${paramIndex}::"TransactionType"`);
    params.push(filters.transactionType);
    paramIndex++;
  }

  if (filters.priceMin !== undefined) {
    conditions.push(`p."price" >= $${paramIndex}`);
    params.push(filters.priceMin);
    paramIndex++;
  }

  if (filters.priceMax !== undefined) {
    conditions.push(`p."price" <= $${paramIndex}`);
    params.push(filters.priceMax);
    paramIndex++;
  }

  if (filters.province) {
    conditions.push(`p."province" ILIKE $${paramIndex}`);
    params.push(`%${filters.province}%`);
    paramIndex++;
  }

  if (filters.city) {
    conditions.push(`p."city" ILIKE $${paramIndex}`);
    params.push(`%${filters.city}%`);
    paramIndex++;
  }

  if (filters.bedroomsMin !== undefined) {
    conditions.push(`p."bedrooms" >= $${paramIndex}`);
    params.push(filters.bedroomsMin);
    paramIndex++;
  }

  if (filters.bedroomsMax !== undefined) {
    conditions.push(`p."bedrooms" <= $${paramIndex}`);
    params.push(filters.bedroomsMax);
    paramIndex++;
  }

  if (filters.bathroomsMin !== undefined) {
    conditions.push(`p."bathrooms" >= $${paramIndex}`);
    params.push(filters.bathroomsMin);
    paramIndex++;
  }

  if (filters.bathroomsMax !== undefined) {
    conditions.push(`p."bathrooms" <= $${paramIndex}`);
    params.push(filters.bathroomsMax);
    paramIndex++;
  }

  const whereClause = conditions.join(" AND ");

  // Count total matching results
  const countQuery = `
    SELECT COUNT(*) as count
    FROM "Property" p
    WHERE ${whereClause}
  `;

  const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
    countQuery,
    ...params
  );
  const total = Number(countResult[0].count);

  // Search query with similarity score
  // Using cosine distance: 1 - (embedding <=> query_embedding)
  const searchQuery = `
    SELECT
      p."id",
      p."title",
      p."propertyType",
      p."transactionType",
      p."price",
      p."province",
      p."city",
      p."barangay",
      p."bedrooms",
      p."bathrooms",
      p."carpark",
      p."lotArea",
      p."floorArea",
      p."photos",
      p."features",
      p."allowCoBroke",
      p."coBrokeSplit",
      p."viewCount",
      p."publishedAt",
      1 - (p."embedding" <=> $1::vector) as similarity,
      a."id" as "agentId",
      a."name" as "agentName",
      a."photo" as "agentPhoto"
    FROM "Property" p
    LEFT JOIN "Agent" a ON p."agentId" = a."id"
    WHERE ${whereClause}
    ORDER BY p."embedding" <=> $1::vector
    LIMIT $${paramIndex}
    OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  const results = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      title: string;
      propertyType: PropertyType;
      transactionType: TransactionType;
      price: Prisma.Decimal;
      province: string;
      city: string;
      barangay: string | null;
      bedrooms: number | null;
      bathrooms: number | null;
      carpark: number | null;
      lotArea: Prisma.Decimal | null;
      floorArea: Prisma.Decimal | null;
      photos: string[];
      features: string[];
      allowCoBroke: boolean;
      coBrokeSplit: Prisma.Decimal;
      viewCount: number;
      publishedAt: Date | null;
      similarity: number;
      agentId: string;
      agentName: string;
      agentPhoto: string | null;
    }>
  >(searchQuery, ...params);

  // Transform results to match expected format
  const formattedResults: SearchResult[] = results.map((r) => ({
    id: r.id,
    title: r.title,
    propertyType: r.propertyType,
    transactionType: r.transactionType,
    price: r.price,
    province: r.province,
    city: r.city,
    barangay: r.barangay,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    carpark: r.carpark,
    lotArea: r.lotArea,
    floorArea: r.floorArea,
    photos: r.photos,
    features: r.features,
    allowCoBroke: r.allowCoBroke,
    coBrokeSplit: r.coBrokeSplit,
    viewCount: r.viewCount,
    publishedAt: r.publishedAt,
    similarity: r.similarity,
    agent: {
      id: r.agentId,
      name: r.agentName,
      photo: r.agentPhoto,
    },
  }));

  return { results: formattedResults, total };
}

/**
 * Update embedding for a property
 */
export async function updatePropertyEmbedding(
  propertyId: string,
  property: PropertyEmbeddingInput
): Promise<void> {
  const embedding = await generatePropertyEmbedding(property);
  const embeddingStr = `[${embedding.join(",")}]`;

  await prisma.$executeRawUnsafe(
    `UPDATE "Property" SET "embedding" = $1::vector, "embeddedAt" = NOW() WHERE "id" = $2`,
    embeddingStr,
    propertyId
  );
}

/**
 * Find similar properties to a given property
 */
export async function findSimilarProperties(
  propertyId: string,
  limit: number = 6
): Promise<SearchResult[]> {
  const query = `
    SELECT
      p."id",
      p."title",
      p."propertyType",
      p."transactionType",
      p."price",
      p."province",
      p."city",
      p."barangay",
      p."bedrooms",
      p."bathrooms",
      p."carpark",
      p."lotArea",
      p."floorArea",
      p."photos",
      p."features",
      p."allowCoBroke",
      p."coBrokeSplit",
      p."viewCount",
      p."publishedAt",
      1 - (p."embedding" <=> source."embedding") as similarity,
      a."id" as "agentId",
      a."name" as "agentName",
      a."photo" as "agentPhoto"
    FROM "Property" p
    CROSS JOIN (SELECT "embedding" FROM "Property" WHERE "id" = $1) source
    LEFT JOIN "Agent" a ON p."agentId" = a."id"
    WHERE p."id" != $1
      AND p."status" = 'AVAILABLE'
      AND p."embedding" IS NOT NULL
    ORDER BY p."embedding" <=> source."embedding"
    LIMIT $2
  `;

  const results = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      title: string;
      propertyType: PropertyType;
      transactionType: TransactionType;
      price: Prisma.Decimal;
      province: string;
      city: string;
      barangay: string | null;
      bedrooms: number | null;
      bathrooms: number | null;
      carpark: number | null;
      lotArea: Prisma.Decimal | null;
      floorArea: Prisma.Decimal | null;
      photos: string[];
      features: string[];
      allowCoBroke: boolean;
      coBrokeSplit: Prisma.Decimal;
      viewCount: number;
      publishedAt: Date | null;
      similarity: number;
      agentId: string;
      agentName: string;
      agentPhoto: string | null;
    }>
  >(query, propertyId, limit);

  return results.map((r) => ({
    id: r.id,
    title: r.title,
    propertyType: r.propertyType,
    transactionType: r.transactionType,
    price: r.price,
    province: r.province,
    city: r.city,
    barangay: r.barangay,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    carpark: r.carpark,
    lotArea: r.lotArea,
    floorArea: r.floorArea,
    photos: r.photos,
    features: r.features,
    allowCoBroke: r.allowCoBroke,
    coBrokeSplit: r.coBrokeSplit,
    viewCount: r.viewCount,
    publishedAt: r.publishedAt,
    similarity: r.similarity,
    agent: {
      id: r.agentId,
      name: r.agentName,
      photo: r.agentPhoto,
    },
  }));
}
