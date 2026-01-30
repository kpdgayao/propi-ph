import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function DiscoverPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // Get all available properties except the current agent's
  const properties = await prisma.property.findMany({
    where: {
      status: "AVAILABLE",
      agentId: { not: session.agentId },
      allowCoBroke: true,
    },
    include: {
      agent: {
        select: {
          name: true,
          phone: true,
        },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discover Properties</h1>
        <p className="text-gray-600">
          Find co-brokerage opportunities from other agents
        </p>
      </div>

      {/* TODO: Add search and filters */}

      {properties.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>No properties available</CardTitle>
            <CardDescription>
              There are no co-brokerage listings at the moment. Check back later!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id}>
              {property.photos[0] && (
                <div className="aspect-video overflow-hidden rounded-t-lg bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={property.photos[0]}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-1 text-lg">
                      {property.title}
                    </CardTitle>
                    <CardDescription>
                      {property.city}, {property.province}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(Number(property.price))}
                  </p>
                  <p className="text-sm text-gray-600">
                    {property.propertyType} • {property.transactionType}
                  </p>
                  {(property.bedrooms || property.bathrooms) && (
                    <p className="text-sm text-gray-600">
                      {property.bedrooms && `${property.bedrooms} BR`}
                      {property.bedrooms && property.bathrooms && " • "}
                      {property.bathrooms && `${property.bathrooms} BA`}
                    </p>
                  )}
                  <div className="mt-3 rounded-md bg-blue-50 p-2">
                    <p className="text-xs font-medium text-blue-700">
                      Co-broke: {Number(property.coBrokeSplit)}% to selling agent
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Listed by {property.agent.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
