import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DiscoverClient } from "@/components/discover/discover-client";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

async function getInitialProperties(agentId: string) {
  const properties = await prisma.property.findMany({
    where: {
      status: "AVAILABLE",
      agentId: { not: agentId },
      allowCoBroke: true,
    },
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
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  // Convert Decimal and Date fields for client serialization
  return properties.map((p) => ({
    ...p,
    price: Number(p.price),
    lotArea: p.lotArea ? Number(p.lotArea) : null,
    floorArea: p.floorArea ? Number(p.floorArea) : null,
    coBrokeSplit: Number(p.coBrokeSplit),
    publishedAt: p.publishedAt?.toISOString() || null,
  }));
}

export default async function DiscoverPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const initialProperties = await getInitialProperties(session.agentId);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <DiscoverClient initialProperties={initialProperties} />
    </Suspense>
  );
}
