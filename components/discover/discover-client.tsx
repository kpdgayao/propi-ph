"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyCard } from "./property-card";
import { SearchFilters, SearchFiltersState } from "./search-filters";
import { Search, Loader2, Grid, List, SlidersHorizontal, X } from "lucide-react";

interface Property {
  id: string;
  title: string;
  propertyType: string;
  transactionType: string;
  price: number | string;
  province: string;
  city: string;
  barangay?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  carpark?: number | null;
  lotArea?: number | string | null;
  floorArea?: number | string | null;
  photos: string[];
  features: string[];
  allowCoBroke: boolean;
  coBrokeSplit: number | string;
  viewCount: number;
  publishedAt: string | null;
  agent: {
    id: string;
    name: string;
    photo?: string | null;
  };
  similarity?: number;
}

interface DiscoverClientProps {
  initialProperties: Property[];
}

const emptyFilters: SearchFiltersState = {
  propertyType: "",
  transactionType: "",
  priceMin: "",
  priceMax: "",
  province: "",
  city: "",
  bedroomsMin: "",
  bedroomsMax: "",
};

export function DiscoverClient({ initialProperties }: DiscoverClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isSearching, setIsSearching] = useState(false);
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [filters, setFilters] = useState<SearchFiltersState>(emptyFilters);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(initialProperties.length);
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);

  // Fetch properties with filters
  const fetchProperties = useCallback(
    async (query?: string) => {
      setIsSearching(true);

      try {
        const params = new URLSearchParams();

        // Use semantic search if there's a query
        const endpoint = query && query.trim().length >= 2
          ? "/api/search"
          : "/api/properties";

        if (query && query.trim().length >= 2) {
          params.set("q", query);
          setIsSemanticSearch(true);
        } else {
          setIsSemanticSearch(false);
        }

        params.set("page", page.toString());
        params.set("limit", "20");

        if (filters.propertyType) params.set("propertyType", filters.propertyType);
        if (filters.transactionType) params.set("transactionType", filters.transactionType);
        if (filters.priceMin) params.set("priceMin", filters.priceMin);
        if (filters.priceMax) params.set("priceMax", filters.priceMax);
        if (filters.province) params.set("province", filters.province);
        if (filters.city) params.set("city", filters.city);
        if (filters.bedroomsMin) params.set("bedroomsMin", filters.bedroomsMin);
        if (filters.bedroomsMax) params.set("bedroomsMax", filters.bedroomsMax);

        if (!query && sortBy) params.set("sortBy", sortBy);

        const response = await fetch(`${endpoint}?${params.toString()}`);
        const data = await response.json();

        if (data.properties) {
          setProperties(data.properties);
          setTotal(data.pagination?.total || data.properties.length);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [filters, sortBy, page]
  );

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProperties(searchQuery);

    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    router.push(`/discover?${params.toString()}`, { scroll: false });
  };

  // Fetch when filters or sort changes
  useEffect(() => {
    fetchProperties(searchQuery || undefined);
  }, [filters, sortBy, page, fetchProperties, searchQuery]);

  const handleFilterChange = (newFilters: SearchFiltersState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(emptyFilters);
    setSearchQuery("");
    setPage(1);
    router.push("/discover", { scroll: false });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "") || searchQuery;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discover Properties</h1>
        <p className="text-gray-600">
          Find co-brokerage opportunities from other agents
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search properties... (e.g., '3 bedroom house in Baguio near schools')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                fetchProperties();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </form>

      {/* Semantic search indicator */}
      {isSemanticSearch && searchQuery && (
        <p className="text-sm text-gray-500">
          Showing AI-powered search results for &ldquo;{searchQuery}&rdquo;
        </p>
      )}

      <div className="flex gap-6">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden w-64 shrink-0 lg:block">
          <SearchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>

        {/* Filters Sidebar - Mobile */}
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowFilters(false)}>
            <div
              className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-white p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {total} {total === 1 ? "property" : "properties"} found
            </p>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Grid */}
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <CardTitle>No properties found</CardTitle>
                <CardDescription>
                  {hasActiveFilters
                    ? "Try adjusting your search or filters"
                    : "There are no co-brokerage listings at the moment"}
                </CardDescription>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleReset} className="mt-4">
                    Clear all filters
                  </Button>
                )}
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
