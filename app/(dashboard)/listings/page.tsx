import Link from "next/link";
import { getSession } from "@/lib/auth";
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
import { Home, Building2, MapPin, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_COLORS = {
  DRAFT: "bg-gray-100 text-gray-700",
  AVAILABLE: "bg-green-100 text-green-700",
  RESERVED: "bg-yellow-100 text-yellow-700",
  SOLD: "bg-blue-100 text-blue-700",
  RENTED: "bg-blue-100 text-blue-700",
  UNLISTED: "bg-orange-100 text-orange-700",
};

const PROPERTY_TYPE_ICONS: Record<string, typeof Home> = {
  HOUSE: Home,
  CONDO: Building2,
  TOWNHOUSE: Home,
  APARTMENT: Building2,
  LOT: MapPin,
  COMMERCIAL: Building2,
  WAREHOUSE: Building2,
  FARM: MapPin,
};

export default async function ListingsPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const listings = await prisma.property.findMany({
    where: { agentId: session.agentId },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: listings.length,
    available: listings.filter((l) => l.status === "AVAILABLE").length,
    draft: listings.filter((l) => l.status === "DRAFT").length,
    sold: listings.filter((l) => l.status === "SOLD" || l.status === "RENTED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <Link href="/listings/new">
          <Button>Add New Listing</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Listings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-gray-500">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            <div className="text-sm text-gray-500">Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
            <div className="text-sm text-gray-500">Sold/Rented</div>
          </CardContent>
        </Card>
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
          {listings.map((listing) => {
            const Icon = PROPERTY_TYPE_ICONS[listing.propertyType] || Home;
            const statusColor = STATUS_COLORS[listing.status] || STATUS_COLORS.DRAFT;

            return (
              <Card key={listing.id} className="overflow-hidden">
                {/* Photo or Placeholder */}
                <div className="relative aspect-video bg-gray-100">
                  {listing.photos.length > 0 ? (
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Icon className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <span
                    className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}
                  >
                    {listing.status}
                  </span>
                  {listing.photos.length > 1 && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                      +{listing.photos.length - 1} photos
                    </span>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <div>
                    <CardTitle className="line-clamp-1 text-lg">
                      {listing.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.city}, {listing.province}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(Number(listing.price))}
                      {listing.transactionType === "RENT" && (
                        <span className="text-sm font-normal text-gray-500">/mo</span>
                      )}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{listing.propertyType}</span>
                      {listing.bedrooms && <span>{listing.bedrooms} BR</span>}
                      {listing.bathrooms && <span>{listing.bathrooms} BA</span>}
                    </div>

                    {listing.lotArea && (
                      <p className="text-sm text-gray-500">
                        {Number(listing.lotArea).toLocaleString()} sqm
                        {listing.floorArea &&
                          ` (${Number(listing.floorArea).toLocaleString()} sqm floor)`}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {listing.viewCount} views
                      </span>
                      <span>
                        {listing.publishedAt
                          ? `Published ${new Date(listing.publishedAt).toLocaleDateString()}`
                          : `Created ${new Date(listing.createdAt).toLocaleDateString()}`}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/listings/${listing.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      {listing.status === "DRAFT" && (
                        <form action={`/api/listings/${listing.id}/publish`} method="POST">
                          <Button type="submit" size="sm">
                            Publish
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
