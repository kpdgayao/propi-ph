import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUserSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Footer } from "@/components/layout/footer";
import { SavedSearchCard } from "@/components/shared/saved-search-card";
import { Bell, ArrowLeft, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SavedSearchesPage() {
  const session = await getUserSession();

  if (!session) {
    redirect("/user/login?redirect=/saved-searches");
  }

  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <BrandLogo href="/discover" showPoweredBy size="sm" />
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </Link>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            <Bell className="mr-2 inline h-6 w-6 text-primary" />
            Saved Searches
          </h1>
          <p className="mt-1 text-gray-600">
            {savedSearches.length} saved {savedSearches.length === 1 ? "search" : "searches"}
          </p>
        </div>

        {savedSearches.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-300" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              No saved searches
            </h2>
            <p className="mt-2 text-gray-500">
              Save your search criteria to get notified when new listings match
            </p>
            <Link href="/discover" className="mt-6 inline-block">
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Start Searching
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedSearches.map((search) => (
              <SavedSearchCard
                key={search.id}
                id={search.id}
                name={search.name}
                query={search.query as Record<string, unknown>}
                alertsOn={search.alertsOn}
                createdAt={search.createdAt.toISOString()}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
