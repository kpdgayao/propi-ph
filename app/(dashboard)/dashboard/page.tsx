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

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // Get agent's listing stats
  const [totalListings, activeListings] = await Promise.all([
    prisma.property.count({
      where: { agentId: session.agentId },
    }),
    prisma.property.count({
      where: { agentId: session.agentId, status: "AVAILABLE" },
    }),
  ]);

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
          <CardHeader className="pb-2">
            <CardDescription>Total Listings</CardDescription>
            <CardTitle className="text-3xl">{totalListings}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              All your property listings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Listings</CardDescription>
            <CardTitle className="text-3xl">{activeListings}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Currently available for co-brokerage
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Profile Views</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Coming soon</p>
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
            <Button>Create New Listing</Button>
          </Link>
          <Link href="/discover">
            <Button variant="outline">Discover Properties</Button>
          </Link>
          <Link href="/listings">
            <Button variant="outline">View My Listings</Button>
          </Link>
        </CardContent>
      </Card>

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
              <Button>Create Your First Listing</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
