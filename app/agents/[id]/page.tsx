import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { brandingConfig } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StartConversation } from "@/components/messages/start-conversation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Footer } from "@/components/layout/footer";
import {
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Building,
  Calendar,
  ExternalLink,
  Bed,
  Bath,
  Maximize,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Generate metadata for social sharing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const agent = await prisma.agent.findUnique({
    where: { id, isActive: true },
    select: {
      name: true,
      headline: true,
      bio: true,
      photo: true,
      areasServed: true,
      _count: { select: { listings: { where: { status: "AVAILABLE" } } } },
    },
  });

  if (!agent) {
    return {
      title: "Agent Not Found",
    };
  }

  const title = `${agent.name} - Real Estate Agent | ${brandingConfig.client.name}`;
  const description = agent.headline
    ? `${agent.headline}. ${agent.areasServed.length > 0 ? `Serving ${agent.areasServed.slice(0, 3).join(", ")}` : ""} - ${agent._count.listings} active listings.`
    : `Licensed real estate agent with ${agent._count.listings} active listings.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: agent.photo
        ? [
            {
              url: agent.photo,
              width: 400,
              height: 400,
              alt: agent.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: agent.photo ? [agent.photo] : [],
    },
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentProfilePage({ params }: PageProps) {
  const { id } = await params;

  const agent = await prisma.agent.findUnique({
    where: { id, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photo: true,
      bio: true,
      headline: true,
      yearsExperience: true,
      socialLinks: true,
      areasServed: true,
      specializations: true,
      prcLicense: true,
      createdAt: true,
      listings: {
        where: { status: "AVAILABLE" },
        select: {
          id: true,
          title: true,
          price: true,
          propertyType: true,
          transactionType: true,
          city: true,
          province: true,
          bedrooms: true,
          bathrooms: true,
          floorArea: true,
          photos: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agent) {
    notFound();
  }

  const socialLinks = agent.socialLinks as Record<string, string> | null;

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
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Agent Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  {agent.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={agent.photo}
                      alt={agent.name}
                      className="mx-auto h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gray-200 text-4xl font-medium text-gray-600">
                      {agent.name.charAt(0)}
                    </div>
                  )}
                  <h1 className="mt-4 text-2xl font-bold">{agent.name}</h1>
                  {agent.headline && (
                    <p className="mt-1 text-gray-600">{agent.headline}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    PRC License: {agent.prcLicense}
                  </p>
                </div>

                {agent.yearsExperience && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {agent.yearsExperience} years experience
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <Button className="w-full" asChild>
                    <a href={`tel:${agent.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      {agent.phone}
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`mailto:${agent.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </a>
                  </Button>
                  <div className="w-full">
                    <StartConversation
                      participantId={agent.id}
                      participantName={agent.name}
                    />
                  </div>
                </div>

                {socialLinks && Object.keys(socialLinks).length > 0 && (
                  <div className="mt-4 flex justify-center gap-3">
                    {socialLinks.facebook && (
                      <a
                        href={socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                    {socialLinks.website && (
                      <a
                        href={socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-900"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {agent.bio && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-3 font-semibold">About</h2>
                  <p className="whitespace-pre-line text-sm text-gray-600">
                    {agent.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {agent.specializations.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-3 font-semibold">Specializations</h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {agent.areasServed.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-3 font-semibold">Areas Served</h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.areasServed.map((area, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        <MapPin className="h-3 w-3" />
                        {area}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Listings */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Available Listings ({agent.listings.length})
              </h2>
            </div>

            {agent.listings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building className="h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-gray-500">No listings available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {agent.listings.map((listing) => (
                  <Link key={listing.id} href={`/properties/${listing.id}`}>
                    <Card className="overflow-hidden transition-shadow hover:shadow-md">
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                        {listing.photos[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={listing.photos[0]}
                            alt={listing.title}
                            className="h-full w-full object-cover"
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
                              listing.transactionType === "SALE"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            For {listing.transactionType === "SALE" ? "Sale" : "Rent"}
                          </span>
                        </div>
                        <h3 className="font-semibold line-clamp-1">
                          {listing.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {listing.city}, {listing.province}
                        </p>
                        <p className="mt-2 text-lg font-bold text-primary">
                          {formatPrice(Number(listing.price))}
                          {listing.transactionType === "RENT" && (
                            <span className="text-sm font-normal text-gray-500">
                              /mo
                            </span>
                          )}
                        </p>
                        <div className="mt-3 flex gap-4 text-sm text-gray-600">
                          {listing.bedrooms !== null && (
                            <span className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              {listing.bedrooms}
                            </span>
                          )}
                          {listing.bathrooms !== null && (
                            <span className="flex items-center gap-1">
                              <Bath className="h-4 w-4" />
                              {listing.bathrooms}
                            </span>
                          )}
                          {listing.floorArea && (
                            <span className="flex items-center gap-1">
                              <Maximize className="h-4 w-4" />
                              {Number(listing.floorArea).toLocaleString()} sqm
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
