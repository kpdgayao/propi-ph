import Link from "next/link";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function ListingsPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const listings = await prisma.property.findMany({
    where: { agentId: session.agentId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600">
            Manage your property listings
          </p>
        </div>
        <Link href="/listings/new">
          <Button>Add New Listing</Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>No listings yet</CardTitle>
            <CardDescription>
              Create your first property listing to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/listings/new">
              <Button>Create Listing</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-1 text-lg">
                      {listing.title}
                    </CardTitle>
                    <CardDescription>
                      {listing.city}, {listing.province}
                    </CardDescription>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      listing.status === "AVAILABLE"
                        ? "bg-green-100 text-green-700"
                        : listing.status === "DRAFT"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(Number(listing.price))}
                  </p>
                  <p className="text-sm text-gray-600">
                    {listing.propertyType} • {listing.transactionType}
                  </p>
                  {(listing.bedrooms || listing.bathrooms) && (
                    <p className="text-sm text-gray-600">
                      {listing.bedrooms && `${listing.bedrooms} BR`}
                      {listing.bedrooms && listing.bathrooms && " • "}
                      {listing.bathrooms && `${listing.bathrooms} BA`}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/listings/${listing.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
