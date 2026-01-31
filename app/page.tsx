import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import { brandingConfig } from "@/lib/branding";
import { HeroSearch } from "@/components/home/hero-search";
import { StatsSection } from "@/components/home/stats-section";
import { PropertyTypes } from "@/components/home/property-types";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { FeaturedAgents } from "@/components/home/featured-agents";
import { Testimonials } from "@/components/home/testimonials";
import { TrustBadges } from "@/components/home/trust-badges";
import { NewsletterSignup } from "@/components/home/newsletter-signup";
import {
  MapPin,
  Shield,
  Sparkles,
  Users,
  TrendingUp,
  Phone,
  ArrowRight,
  Home,
  CheckCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getHomePageData() {
  try {
    const [propertyCount, agentCount, properties, agents] = await Promise.all([
      prisma.property.count({ where: { status: "AVAILABLE" } }),
      prisma.agent.count({ where: { isActive: true } }),
      prisma.property.findMany({
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
      }),
      prisma.agent.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          photo: true,
          _count: {
            select: {
              listings: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

    return {
      stats: { propertyCount, agentCount },
      properties: properties.map((p) => ({
        ...p,
        price: p.price.toString(),
        floorArea: p.floorArea?.toString() || null,
      })),
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        photo: a.photo,
        listingsCount: a._count.listings,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    return {
      stats: { propertyCount: 0, agentCount: 0 },
      properties: [],
      agents: [],
    };
  }
}

export default async function HomePage() {
  const { stats, properties, agents } = await getHomePageData();
  const { client, contact } = brandingConfig;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          {/* Gradient Background - can be replaced with actual Baguio image */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-green-700 to-emerald-800" />

          {/* Animated Pine Tree Pattern */}
          <div className="absolute inset-0 opacity-[0.07]">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="pines" x="0" y="0" width="10" height="15" patternUnits="userSpaceOnUse">
                <path d="M5 15 L5 10 L2 10 L5 5 L3 5 L5 0 L7 5 L5 5 L8 10 L5 10 Z" fill="currentColor" />
              </pattern>
              <rect x="0" y="0" width="100" height="100" fill="url(#pines)" />
            </svg>
          </div>

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:py-28 w-full">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
              <Sparkles className="h-4 w-4" />
              AI-Powered Real Estate Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              {client.name}
            </h1>
            <p className="mt-4 text-xl sm:text-2xl text-white/90 font-light">
              {client.tagline}
            </p>
            <p className="mt-3 text-lg text-white/70 max-w-2xl mx-auto">
              Discover your dream property in Baguio City, Benguet, La Union, and Pangasinan
            </p>

            {/* Search Bar */}
            <div className="mt-10">
              <HeroSearch />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 max-w-4xl mx-auto">
            <StatsSection
              propertyCount={stats.propertyCount}
              agentCount={stats.agentCount}
            />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Property Types Quick Navigation */}
      <PropertyTypes />

      {/* Featured Properties */}
      {properties.length > 0 ? (
        <FeaturedProperties properties={properties} />
      ) : (
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Featured
            </span>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Top Properties
            </h2>
            <p className="mt-2 text-gray-600 mb-8">
              Discover the best listings in Northern Luzon
            </p>
            <Link href="/discover">
              <Button size="lg">
                Browse All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Why Choose Us - Enhanced */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Why Us
            </span>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Why Choose {client.shortName}?
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              Your trusted partner for real estate in Northern Luzon with cutting-edge technology and local expertise
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MapPin,
                title: "Local Expertise",
                description: "Deep knowledge of Baguio City and Northern Luzon real estate markets with on-the-ground insights",
                color: "from-emerald-500 to-teal-600",
              },
              {
                icon: Shield,
                title: "Licensed Agents",
                description: "All our agents are PRC-licensed real estate professionals you can trust",
                color: "from-blue-500 to-indigo-600",
              },
              {
                icon: Sparkles,
                title: "AI-Powered",
                description: "Smart search and AI-generated descriptions help you find the perfect property faster",
                color: "from-purple-500 to-pink-600",
              },
              {
                icon: Users,
                title: "Co-Brokerage",
                description: "Collaborate with other agents for faster transactions and wider property access",
                color: "from-amber-500 to-orange-600",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      {agents.length > 0 ? (
        <div className="bg-gray-50">
          <FeaturedAgents agents={agents} />
        </div>
      ) : (
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Our Team
            </span>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Meet Our Agents
            </h2>
            <p className="mt-2 text-gray-600 mb-8">
              Licensed professionals ready to help you
            </p>
            <Link href="/agents">
              <Button size="lg" variant="outline">
                View All Agents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <Testimonials />

      {/* Areas Served */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Coverage
            </span>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Areas We Serve
            </h2>
            <p className="mt-2 text-gray-600">
              Find properties across Northern Luzon&apos;s most desirable locations
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Baguio City",
                desc: "The Summer Capital",
                highlights: ["Pine-covered hills", "Cool climate", "Session Road"],
                image: "from-emerald-400 to-teal-600"
              },
              {
                name: "Benguet",
                desc: "Highland Province",
                highlights: ["Mountain views", "Vegetable farms", "Cultural heritage"],
                image: "from-green-400 to-emerald-600"
              },
              {
                name: "La Union",
                desc: "Surfing & Beach Towns",
                highlights: ["Beach properties", "Surf spots", "Coastal living"],
                image: "from-blue-400 to-cyan-600"
              },
              {
                name: "Pangasinan",
                desc: "Hundred Islands",
                highlights: ["Beach resorts", "Agricultural land", "Historic towns"],
                image: "from-amber-400 to-orange-500"
              },
            ].map((area) => (
              <Link
                key={area.name}
                href={`/discover?location=${encodeURIComponent(area.name)}`}
              >
                <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${area.image} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <CardContent className="relative z-10 p-6">
                    <div className="mb-4 p-3 bg-primary/10 rounded-xl inline-block group-hover:bg-white/20 transition-colors">
                      <Home className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white transition-colors">
                      {area.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 group-hover:text-white/80 transition-colors">
                      {area.desc}
                    </p>
                    <ul className="mt-4 space-y-1">
                      {area.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-white/90 transition-colors">
                          <CheckCircle className="h-3.5 w-3.5 text-primary group-hover:text-white transition-colors" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary group-hover:text-white transition-colors">
                      Browse Properties
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* CTA for Agents */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="lg:max-w-xl">
              <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-medium rounded-full mb-4">
                For Agents
              </span>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Are You a Licensed Real Estate Agent?
              </h2>
              <p className="mt-4 text-lg text-white/70 leading-relaxed">
                Join {client.name} and grow your business with our AI-powered platform.
                List properties, manage leads, and collaborate with fellow agents.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Free property listings with AI descriptions",
                  "Co-brokerage opportunities with other agents",
                  "Modern dashboard to manage your portfolio",
                  "Connect with qualified buyers and sellers",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full lg:w-auto h-14 px-8 text-lg">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Join Our Team
                </Button>
              </Link>
              <a href={`tel:${contact.phone}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full lg:w-auto h-14 px-8 text-lg border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call {contact.phone}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
