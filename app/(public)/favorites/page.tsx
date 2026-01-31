import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUserSession } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Footer } from "@/components/layout/footer";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Building,
  ArrowLeft,
  Search,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const session = await getUserSession();

  if (!session) {
    redirect("/user/login?redirect=/favorites");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.userId },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          price: true,
          transactionType: true,
          propertyType: true,
          city: true,
          province: true,
          bedrooms: true,
          bathrooms: true,
          photos: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter for available properties
  const availableFavorites = favorites.filter(
    (fav) => fav.property.status === "AVAILABLE"
  );

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
            <Heart className="mr-2 inline h-6 w-6 text-red-500" />
            My Favorites
          </h1>
          <p className="mt-1 text-gray-600">
            {availableFavorites.length} saved properties
          </p>
        </div>

        {availableFavorites.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-300" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              No favorites yet
            </h2>
            <p className="mt-2 text-gray-500">
              Start browsing and save properties you like
            </p>
            <Link href="/discover" className="mt-6 inline-block">
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Browse Properties
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {availableFavorites.map((fav) => (
              <Link key={fav.id} href={`/properties/${fav.property.id}`}>
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    {fav.property.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fav.property.photos[0]}
                        alt={fav.property.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Building className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          fav.property.transactionType === "SALE"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        For{" "}
                        {fav.property.transactionType === "SALE"
                          ? "Sale"
                          : "Rent"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {fav.property.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {fav.property.city}, {fav.property.province}
                    </p>
                    <p className="mt-2 text-lg font-bold text-primary">
                      {formatPrice(Number(fav.property.price))}
                      {fav.property.transactionType === "RENT" && (
                        <span className="text-sm font-normal text-gray-500">
                          /mo
                        </span>
                      )}
                    </p>
                    {(fav.property.bedrooms || fav.property.bathrooms) && (
                      <div className="mt-2 flex gap-4 text-sm text-gray-600">
                        {fav.property.bedrooms && (
                          <span className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            {fav.property.bedrooms} Beds
                          </span>
                        )}
                        {fav.property.bathrooms && (
                          <span className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            {fav.property.bathrooms} Baths
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
