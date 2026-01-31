import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingModerationTable } from "@/components/admin/listing-moderation-table";
import { Building, Star, AlertTriangle, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ filter?: string; search?: string; page?: string }>;
}

async function getListingStats() {
  const [total, available, featured, flagged] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "AVAILABLE" } }),
    prisma.property.count({ where: { isFeatured: true, status: "AVAILABLE" } }),
    prisma.property.count({ where: { isFlagged: true } }),
  ]);

  return { total, available, featured, flagged };
}

async function getListings(filter?: string, search?: string, page = 1) {
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filter === "flagged") {
    where.isFlagged = true;
  } else if (filter === "featured") {
    where.isFeatured = true;
    where.status = "AVAILABLE";
  } else if (filter === "available") {
    where.status = "AVAILABLE";
  } else if (filter === "unlisted") {
    where.status = "UNLISTED";
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { agent: { name: { contains: search, mode: "insensitive" } } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        isFeatured: true,
        isFlagged: true,
        flagReason: true,
        price: true,
        city: true,
        province: true,
        photos: true,
        viewCount: true,
        createdAt: true,
        agent: {
          select: {
            id: true,
            name: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    listings: listings.map((l) => ({
      ...l,
      price: Number(l.price),
      createdAt: l.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const filter = params.filter;
  const search = params.search;
  const page = parseInt(params.page || "1");

  const [stats, { listings, pagination }] = await Promise.all([
    getListingStats(),
    getListings(filter, search, page),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Listing Moderation</h1>
        <p className="text-gray-600">Review, feature, and moderate property listings</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Listings
            </CardTitle>
            <Building className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Available
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.available}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Featured
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.featured}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Flagged
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.flagged}</div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Table */}
      <ListingModerationTable
        listings={listings}
        pagination={pagination}
        currentFilter={filter}
        currentSearch={search}
      />
    </div>
  );
}
