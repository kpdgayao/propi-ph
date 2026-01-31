import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import { brandingConfig } from "@/lib/branding";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  Users,
  TrendingUp,
  Shield,
  MapPin,
  Home,
  Bed,
  Bath,
  ArrowRight,
  Sparkles,
  Building,
  Phone,
} from "lucide-react";

export const dynamic = "force-dynamic";

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
      photos: true,
    },
    orderBy: { viewCount: "desc" },
    take: 6,
  });
}

async function getStats() {
  const [propertyCount, agentCount] = await Promise.all([
    prisma.property.count({ where: { status: "AVAILABLE" } }),
    prisma.agent.count({ where: { isActive: true } }),
  ]);
  return { propertyCount, agentCount };
}

export default async function HomePage() {
  const [properties, stats] = await Promise.all([
    getFeaturedProperties(),
    getStats(),
  ]);

  const { client, contact } = brandingConfig;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-green-800 text-white">
        {/* Pine tree pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="pines" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 20 L10 12 L5 12 L10 6 L7 6 L10 0 L13 6 L10 6 L15 12 L10 12 Z" fill="currentColor" />
            </pattern>
            <rect x="0" y="0" width="100" height="100" fill="url(#pines)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {client.name}
            </h1>
            <p className="mt-4 text-xl text-white/90 sm:text-2xl">
              {client.tagline}
            </p>
            <p className="mt-2 text-lg text-white/70">
              Discover your dream property in Baguio City, Benguet, La Union, and Pangasinan
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/discover">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Properties
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto">
                  Agent Login
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <p className="text-3xl font-bold">{stats.propertyCount}+</p>
                <p className="text-white/70">Active Listings</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.agentCount}+</p>
                <p className="text-white/70">Licensed Agents</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-3xl font-bold">4</p>
                <p className="text-white/70">Provinces Served</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {properties.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Featured Properties
                </h2>
                <p className="mt-2 text-gray-600">
                  Discover top listings in Northern Luzon
                </p>
              </div>
              <Link href="/discover" className="hidden sm:block">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`}>
                  <Card className="overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      {property.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={property.photos[0]}
                          alt={property.title}
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
                            property.transactionType === "SALE"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          For {property.transactionType === "SALE" ? "Sale" : "Rent"}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {property.city}, {property.province}
                      </p>
                      <p className="mt-2 text-lg font-bold text-primary">
                        {formatPrice(Number(property.price))}
                        {property.transactionType === "RENT" && (
                          <span className="text-sm font-normal text-gray-500">/mo</span>
                        )}
                      </p>
                      {(property.bedrooms || property.bathrooms) && (
                        <div className="mt-2 flex gap-4 text-sm text-gray-600">
                          {property.bedrooms && (
                            <span className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              {property.bedrooms} Beds
                            </span>
                          )}
                          {property.bathrooms && (
                            <span className="flex items-center gap-1">
                              <Bath className="h-4 w-4" />
                              {property.bathrooms} Baths
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/discover">
                <Button variant="outline">
                  View All Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Why Choose {client.shortName}?
            </h2>
            <p className="mt-2 text-gray-600">
              Your trusted partner for real estate in Northern Luzon
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Local Expertise</h3>
              <p className="mt-2 text-sm text-gray-600">
                Deep knowledge of Baguio City and Northern Luzon real estate markets
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Licensed Agents</h3>
              <p className="mt-2 text-sm text-gray-600">
                All our agents are PRC-licensed real estate professionals
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">AI-Powered</h3>
              <p className="mt-2 text-sm text-gray-600">
                Smart search and AI-generated descriptions for better matches
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Co-Brokerage</h3>
              <p className="mt-2 text-sm text-gray-600">
                Collaborate with other agents for faster transactions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Areas Served */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Areas We Serve
            </h2>
            <p className="mt-2 text-gray-600">
              Find properties across Northern Luzon
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Baguio City", desc: "The Summer Capital" },
              { name: "Benguet", desc: "Highland Province" },
              { name: "La Union", desc: "Surfing & Beach Towns" },
              { name: "Pangasinan", desc: "Hundred Islands" },
            ].map((area) => (
              <Link
                key={area.name}
                href={`/discover?location=${encodeURIComponent(area.name)}`}
              >
                <Card className="p-6 text-center transition-all hover:border-primary hover:shadow-md">
                  <Home className="mx-auto h-8 w-8 text-primary" />
                  <h3 className="mt-3 font-semibold text-gray-900">{area.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{area.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Agents */}
      <section className="bg-primary py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Are You a Licensed Real Estate Agent?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join {client.name} and grow your business with our AI-powered platform
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                <TrendingUp className="mr-2 h-5 w-5" />
                Join Our Team
              </Button>
            </Link>
            <a href={`tel:${contact.phone}`}>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Phone className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
