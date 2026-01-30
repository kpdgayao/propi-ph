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
import { Eye, Home, TrendingUp, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // Get agent's listing stats and recent listings
  const [totalListings, activeListings, viewsResult, recentListings] = await Promise.all([
    prisma.property.count({
      where: { agentId: session.agentId },
    }),
    prisma.property.count({
      where: { agentId: session.agentId, status: "AVAILABLE" },
    }),
    prisma.property.aggregate({
      where: { agentId: session.agentId },
      _sum: { viewCount: true },
    }),
    prisma.property.findMany({
      where: { agentId: session.agentId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        price: true,
        propertyType: true,
        transactionType: true,
        city: true,
        province: true,
        photos: true,
        viewCount: true,
        publishedAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const totalViews = viewsResult._sum.viewCount || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.name.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here&apos;s an overview of your real estate activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Listings</CardDescription>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalListings}</div>
            <p className="text-xs text-muted-foreground">
              All your property listings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Active Listings</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeListings}</div>
            <p className="text-xs text-muted-foreground">
              Currently available for co-brokerage
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Views</CardDescription>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all your listings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with common tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href="/listings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Listing
            </Button>
          </Link>
          <Link href="/discover">
            <Button variant="outline">Discover Properties</Button>
          </Link>
          <Link href="/listings">
            <Button variant="outline">View My Listings</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Listings */}
      {recentListings.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Listings</CardTitle>
              <CardDescription>Your latest property listings</CardDescription>
            </div>
            <Link href="/listings">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-gray-50"
                >
                  {/* Thumbnail */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {listing.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <Home className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">
                      {listing.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {listing.city}, {listing.province}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {formatPrice(Number(listing.price))}
                    </p>
                  </div>

                  {/* Status & Views */}
                  <div className="hidden shrink-0 text-right sm:block">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        listing.status === "AVAILABLE"
                          ? "bg-green-100 text-green-800"
                          : listing.status === "DRAFT"
                          ? "bg-gray-100 text-gray-800"
                          : listing.status === "SOLD"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {listing.status}
                    </span>
                    <p className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-500">
                      <Eye className="h-3 w-3" />
                      {listing.viewCount}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {totalListings === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              You haven&apos;t created any listings yet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Create your first property listing to start connecting with other
              agents for co-brokerage opportunities.
            </p>
            <Link href="/listings/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
