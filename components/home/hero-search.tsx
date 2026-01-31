"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Home, Banknote } from "lucide-react";

const LOCATIONS = [
  { value: "Baguio City", label: "Baguio City" },
  { value: "Benguet", label: "Benguet" },
  { value: "La Union", label: "La Union" },
  { value: "Pangasinan", label: "Pangasinan" },
];

const PROPERTY_TYPES = [
  { value: "HOUSE", label: "House" },
  { value: "CONDO", label: "Condominium" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "LOT", label: "Lot / Land" },
  { value: "COMMERCIAL", label: "Commercial" },
];

const PRICE_RANGES = [
  { value: "0-3000000", label: "Under ₱3M" },
  { value: "3000000-5000000", label: "₱3M - ₱5M" },
  { value: "5000000-10000000", label: "₱5M - ₱10M" },
  { value: "10000000-20000000", label: "₱10M - ₱20M" },
  { value: "20000000-999999999", label: "₱20M+" },
];

export function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (propertyType) params.set("propertyType", propertyType);
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }
    router.push(`/discover?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-2 md:p-3">
        <div className="flex flex-col md:flex-row gap-2 md:gap-0">
          {/* Location */}
          <div className="flex-1 md:border-r border-gray-200">
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="border-0 h-12 md:h-14 focus:ring-0 rounded-xl md:rounded-none md:rounded-l-xl">
                <div className="flex items-center gap-2 text-left">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="truncate">
                    <SelectValue placeholder="Location" />
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property Type */}
          <div className="flex-1 md:border-r border-gray-200">
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="border-0 h-12 md:h-14 focus:ring-0 rounded-xl md:rounded-none">
                <div className="flex items-center gap-2 text-left">
                  <Home className="h-4 w-4 text-primary shrink-0" />
                  <div className="truncate">
                    <SelectValue placeholder="Property Type" />
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="flex-1">
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="border-0 h-12 md:h-14 focus:ring-0 rounded-xl md:rounded-none">
                <div className="flex items-center gap-2 text-left">
                  <Banknote className="h-4 w-4 text-primary shrink-0" />
                  <div className="truncate">
                    <SelectValue placeholder="Budget" />
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                {PRICE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            size="lg"
            className="h-12 md:h-14 px-8 rounded-xl md:rounded-l-none md:rounded-r-xl"
          >
            <Search className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Search</span>
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
        <span className="text-white/70">Popular:</span>
        {["Baguio City", "La Union", "Benguet"].map((area) => (
          <button
            key={area}
            onClick={() => router.push(`/discover?location=${encodeURIComponent(area)}`)}
            className="text-white/90 hover:text-white underline underline-offset-2 transition-colors"
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
}
