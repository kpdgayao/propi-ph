import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Building,
  Heart,
} from "lucide-react";

async function getFeaturedProperties() {
  return prisma.property.findMany({
    where: { status: "AVAILABLE" },
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
      floorArea: true,
      photos: true,
    },
    orderBy: { viewCount: "desc" },
    take: 6,
  });
}

export async function FeaturedProperties() {
  const properties = await getFeaturedProperties();

  if (properties.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Featured
            </span>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Top Properties
            </h2>
            <p className="mt-2 text-gray-600">
              Discover the best listings in Northern Luzon
            </p>
          </div>
          <Link href="/discover" className="hidden sm:block">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <Card className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 shadow-lg">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {property.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={property.photos[0]}
                      alt={property.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Building className="h-16 w-16 text-gray-300" />
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Transaction Badge */}
                  <span
                    className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold shadow-lg ${
                      property.transactionType === "SALE"
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    For {property.transactionType === "SALE" ? "Sale" : "Rent"}
                  </span>

                  {/* Wishlist Button */}
                  <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-red-500 hover:scale-110"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: Add to favorites
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </button>

                  {/* Price on Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xl font-bold text-white drop-shadow-lg">
                      {formatPrice(Number(property.price))}
                      {property.transactionType === "RENT" && (
                        <span className="text-sm font-normal">/mo</span>
                      )}
                    </span>
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Property Type */}
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    {property.propertyType}
                  </span>

                  {/* Title */}
                  <h3 className="mt-1 font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>

                  {/* Location */}
                  <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {property.city}, {property.province}
                  </p>

                  {/* Price (visible on mobile) */}
                  <p className="mt-3 text-xl font-bold text-primary lg:hidden">
                    {formatPrice(Number(property.price))}
                    {property.transactionType === "RENT" && (
                      <span className="text-sm font-normal text-gray-500">/mo</span>
                    )}
                  </p>

                  {/* Specs */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-600">
                    {property.bedrooms !== null && property.bedrooms > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4 text-gray-400" />
                        {property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}
                      </span>
                    )}
                    {property.bathrooms !== null && property.bathrooms > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4 text-gray-400" />
                        {property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}
                      </span>
                    )}
                    {property.floorArea && (
                      <span className="flex items-center gap-1.5">
                        <Maximize className="h-4 w-4 text-gray-400" />
                        {Number(property.floorArea)} sqm
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href="/discover">
            <Button variant="outline" size="lg">
              View All Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
