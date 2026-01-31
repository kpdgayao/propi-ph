"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Star,
  AlertTriangle,
  MoreVertical,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/utils";

interface Listing {
  id: string;
  title: string;
  status: string;
  isFeatured: boolean;
  isFlagged: boolean;
  flagReason: string | null;
  price: number;
  city: string;
  province: string;
  photos: string[];
  viewCount: number;
  createdAt: string;
  agent: {
    id: string;
    name: string;
    isVerified: boolean;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ListingModerationTableProps {
  listings: Listing[];
  pagination: Pagination;
  currentFilter?: string;
  currentSearch?: string;
}

const filters = [
  { value: "", label: "All Listings" },
  { value: "available", label: "Available" },
  { value: "featured", label: "Featured" },
  { value: "flagged", label: "Flagged" },
  { value: "unlisted", label: "Unlisted" },
];

export function ListingModerationTable({
  listings,
  pagination,
  currentFilter,
  currentSearch,
}: ListingModerationTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || "");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const updateUrl = (params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    router.push(`/admin/listings?${newParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search, page: undefined });
  };

  const handleFilterChange = (filter: string) => {
    updateUrl({ filter: filter || undefined, page: undefined });
  };

  const handlePageChange = (page: number) => {
    updateUrl({ page: String(page) });
  };

  const moderateListing = async (
    listingId: string,
    data: { isFeatured?: boolean; isFlagged?: boolean; status?: string; flagReason?: string }
  ) => {
    setIsUpdating(listingId);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to moderate listing");
      }

      toast({
        title: "Listing updated",
        description: "Listing has been moderated successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to moderate listing",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={currentFilter === filter.value || (!currentFilter && !filter.value) ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button type="submit" size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No listings found
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {listing.photos[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={listing.photos[0]}
                            alt={listing.title}
                            className="h-12 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-200 text-gray-400">
                            No img
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{listing.title}</p>
                          <p className="text-sm text-gray-500">
                            {listing.city}, {listing.province}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{listing.agent.name}</p>
                        {listing.agent.isVerified && (
                          <span className="text-xs text-green-600">Verified</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(listing.price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Eye className="h-4 w-4" />
                        {listing.viewCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            listing.status === "AVAILABLE"
                              ? "bg-green-100 text-green-800"
                              : listing.status === "UNLISTED"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {listing.status}
                        </span>
                        {listing.isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                            <Star className="h-3 w-3" />
                            Featured
                          </span>
                        )}
                        {listing.isFlagged && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            <AlertTriangle className="h-3 w-3" />
                            Flagged
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUpdating === listing.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/properties/${listing.id}`} target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Listing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!listing.isFeatured ? (
                            <DropdownMenuItem
                              onClick={() =>
                                moderateListing(listing.id, { isFeatured: true })
                              }
                              className="text-yellow-600"
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Feature Listing
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                moderateListing(listing.id, { isFeatured: false })
                              }
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Remove from Featured
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {!listing.isFlagged ? (
                            <DropdownMenuItem
                              onClick={() =>
                                moderateListing(listing.id, {
                                  isFlagged: true,
                                  flagReason: "Flagged by admin for review",
                                })
                              }
                              className="text-red-600"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Flag for Review
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                moderateListing(listing.id, { isFlagged: false })
                              }
                              className="text-green-600"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Clear Flag
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {listing.status === "AVAILABLE" ? (
                            <DropdownMenuItem
                              onClick={() =>
                                moderateListing(listing.id, { status: "UNLISTED" })
                              }
                              className="text-red-600"
                            >
                              Take Down Listing
                            </DropdownMenuItem>
                          ) : listing.status === "UNLISTED" ? (
                            <DropdownMenuItem
                              onClick={() =>
                                moderateListing(listing.id, { status: "AVAILABLE" })
                              }
                              className="text-green-600"
                            >
                              Restore Listing
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} listings
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
