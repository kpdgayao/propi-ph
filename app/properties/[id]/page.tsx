import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, formatArea } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bed,
  Bath,
  Car,
  Maximize,
  MapPin,
  Calendar,
  Eye,
  ArrowLeft,
  Phone,
  Mail,
  Building,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const propertyTypeLabels: Record<string, string> = {
  HOUSE: "House",
  CONDO: "Condominium",
  TOWNHOUSE: "Townhouse",
  APARTMENT: "Apartment",
  LOT: "Lot/Land",
  COMMERCIAL: "Commercial Property",
  WAREHOUSE: "Warehouse",
  FARM: "Farm/Agricultural Land",
};

const furnishingLabels: Record<string, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi-Furnished",
  FULLY_FURNISHED: "Fully Furnished",
};

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          photo: true,
          bio: true,
          prcLicense: true,
          areasServed: true,
          specializations: true,
        },
      },
    },
  });

  if (!property || property.status !== "AVAILABLE") {
    notFound();
  }

  // Increment view count (fire and forget)
  prisma.property
    .update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
    .catch((err) => console.error("Failed to increment view count:", err));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Photos */}
            {property.photos.length > 0 && (
              <div className="overflow-hidden rounded-lg bg-gray-100">
                <div className="grid gap-2">
                  {/* Main photo */}
                  <div className="aspect-[16/9] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={property.photos[0]}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Thumbnail grid */}
                  {property.photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {property.photos.slice(1, 5).map((photo, index) => (
                        <div
                          key={index}
                          className="aspect-square overflow-hidden rounded-md"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt={`${property.title} ${index + 2}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Title and Price */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className={`mb-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                      property.transactionType === "SALE"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    For {property.transactionType === "SALE" ? "Sale" : "Rent"}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    {property.title}
                  </h1>
                  <p className="mt-1 flex items-center gap-1 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {property.barangay && `${property.barangay}, `}
                    {property.city}, {property.province}
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary">
                {formatPrice(Number(property.price))}
                {property.transactionType === "RENT" && (
                  <span className="text-lg font-normal text-gray-500">/month</span>
                )}
              </p>
            </div>

            {/* Key Specs */}
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
                {property.bedrooms !== null && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Bed className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{property.bedrooms}</p>
                      <p className="text-sm text-gray-500">Bedrooms</p>
                    </div>
                  </div>
                )}
                {property.bathrooms !== null && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Bath className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{property.bathrooms}</p>
                      <p className="text-sm text-gray-500">Bathrooms</p>
                    </div>
                  </div>
                )}
                {property.carpark !== null && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Car className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{property.carpark}</p>
                      <p className="text-sm text-gray-500">Parking</p>
                    </div>
                  </div>
                )}
                {property.floorArea && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Maximize className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {Number(property.floorArea).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">sqm Floor</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-gray-700">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <dt className="text-sm text-gray-500">Property Type</dt>
                    <dd className="font-medium">
                      {propertyTypeLabels[property.propertyType] ||
                        property.propertyType}
                    </dd>
                  </div>
                  {property.lotArea && (
                    <div>
                      <dt className="text-sm text-gray-500">Lot Area</dt>
                      <dd className="font-medium">
                        {formatArea(Number(property.lotArea))}
                      </dd>
                    </div>
                  )}
                  {property.floorArea && (
                    <div>
                      <dt className="text-sm text-gray-500">Floor Area</dt>
                      <dd className="font-medium">
                        {formatArea(Number(property.floorArea))}
                      </dd>
                    </div>
                  )}
                  {property.floors && (
                    <div>
                      <dt className="text-sm text-gray-500">Floors</dt>
                      <dd className="font-medium">{property.floors}</dd>
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div>
                      <dt className="text-sm text-gray-500">Year Built</dt>
                      <dd className="font-medium">{property.yearBuilt}</dd>
                    </div>
                  )}
                  {property.furnishing && (
                    <div>
                      <dt className="text-sm text-gray-500">Furnishing</dt>
                      <dd className="font-medium">
                        {furnishingLabels[property.furnishing] ||
                          property.furnishing}
                      </dd>
                    </div>
                  )}
                  {property.pricePerSqm && (
                    <div>
                      <dt className="text-sm text-gray-500">Price per sqm</dt>
                      <dd className="font-medium">
                        {formatPrice(Number(property.pricePerSqm))}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Features */}
            {property.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Listed by</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {property.agent.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={property.agent.photo}
                      alt={property.agent.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-medium text-gray-600">
                      {property.agent.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{property.agent.name}</p>
                    <p className="text-sm text-gray-500">
                      PRC License: {property.agent.prcLicense}
                    </p>
                  </div>
                </div>

                {property.agent.bio && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {property.agent.bio}
                  </p>
                )}

                {property.agent.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {property.agent.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-2 border-t pt-4">
                  <Button className="w-full" asChild>
                    <a href={`tel:${property.agent.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      {property.agent.phone}
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`mailto:${property.agent.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Co-Broke Info */}
            {property.allowCoBroke && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-blue-900">
                    Co-Brokerage Available
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    This property is open for co-brokerage. Selling agent
                    receives {Number(property.coBrokeSplit)}% commission split.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{property.viewCount} views</span>
                </div>
                {property.publishedAt && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(property.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
