"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export interface SearchFiltersState {
  propertyType: string;
  transactionType: string;
  priceMin: string;
  priceMax: string;
  province: string;
  city: string;
  bedroomsMin: string;
  bedroomsMax: string;
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onFilterChange: (filters: SearchFiltersState) => void;
  onReset: () => void;
}

const propertyTypes = [
  { value: "", label: "All Types" },
  { value: "HOUSE", label: "House" },
  { value: "CONDO", label: "Condominium" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "LOT", label: "Lot/Land" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "FARM", label: "Farm/Agricultural" },
];

const transactionTypes = [
  { value: "", label: "Buy or Rent" },
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
];

const priceRanges = {
  SALE: [
    { value: "", min: "", max: "", label: "Any Price" },
    { value: "0-2m", min: "0", max: "2000000", label: "Under PHP 2M" },
    { value: "2m-5m", min: "2000000", max: "5000000", label: "PHP 2M - 5M" },
    { value: "5m-10m", min: "5000000", max: "10000000", label: "PHP 5M - 10M" },
    { value: "10m-20m", min: "10000000", max: "20000000", label: "PHP 10M - 20M" },
    { value: "20m+", min: "20000000", max: "", label: "PHP 20M+" },
  ],
  RENT: [
    { value: "", min: "", max: "", label: "Any Price" },
    { value: "0-15k", min: "0", max: "15000", label: "Under PHP 15K/mo" },
    { value: "15k-30k", min: "15000", max: "30000", label: "PHP 15K - 30K/mo" },
    { value: "30k-50k", min: "30000", max: "50000", label: "PHP 30K - 50K/mo" },
    { value: "50k-100k", min: "50000", max: "100000", label: "PHP 50K - 100K/mo" },
    { value: "100k+", min: "100000", max: "", label: "PHP 100K+/mo" },
  ],
};

const bedroomOptions = [
  { value: "", label: "Any" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5+" },
];

// Northern Luzon provinces
const provinces = [
  { value: "", label: "All Provinces" },
  { value: "Benguet", label: "Benguet" },
  { value: "Abra", label: "Abra" },
  { value: "Apayao", label: "Apayao" },
  { value: "Ifugao", label: "Ifugao" },
  { value: "Kalinga", label: "Kalinga" },
  { value: "Mountain Province", label: "Mountain Province" },
  { value: "Ilocos Norte", label: "Ilocos Norte" },
  { value: "Ilocos Sur", label: "Ilocos Sur" },
  { value: "La Union", label: "La Union" },
  { value: "Pangasinan", label: "Pangasinan" },
];

// Key cities in Northern Luzon
const cities: Record<string, { value: string; label: string }[]> = {
  "": [{ value: "", label: "All Cities" }],
  Benguet: [
    { value: "", label: "All Cities" },
    { value: "Baguio City", label: "Baguio City" },
    { value: "La Trinidad", label: "La Trinidad" },
    { value: "Itogon", label: "Itogon" },
    { value: "Tuba", label: "Tuba" },
    { value: "Tublay", label: "Tublay" },
  ],
  "La Union": [
    { value: "", label: "All Cities" },
    { value: "San Fernando", label: "San Fernando" },
    { value: "San Juan", label: "San Juan" },
    { value: "Bauang", label: "Bauang" },
  ],
  Pangasinan: [
    { value: "", label: "All Cities" },
    { value: "Dagupan", label: "Dagupan" },
    { value: "San Carlos City", label: "San Carlos City" },
    { value: "Alaminos", label: "Alaminos" },
    { value: "Urdaneta", label: "Urdaneta" },
  ],
};

export function SearchFilters({
  filters,
  onFilterChange,
  onReset,
}: SearchFiltersProps) {
  const [priceRangeKey, setPriceRangeKey] = useState("");

  const currentPriceRanges =
    filters.transactionType === "RENT" ? priceRanges.RENT : priceRanges.SALE;

  const currentCities = cities[filters.province] || cities[""];

  const handleChange = (key: keyof SearchFiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value };

    // Reset city when province changes
    if (key === "province") {
      newFilters.city = "";
    }

    // Reset price when transaction type changes
    if (key === "transactionType") {
      newFilters.priceMin = "";
      newFilters.priceMax = "";
      setPriceRangeKey("");
    }

    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (rangeKey: string) => {
    setPriceRangeKey(rangeKey);
    const range = currentPriceRanges.find((r) => r.value === rangeKey);
    if (range) {
      onFilterChange({
        ...filters,
        priceMin: range.min,
        priceMax: range.max,
      });
    }
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Transaction Type */}
      <div className="space-y-2">
        <Label>Transaction</Label>
        <Select
          value={filters.transactionType}
          onValueChange={(v) => handleChange("transactionType", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Buy or Rent" />
          </SelectTrigger>
          <SelectContent>
            {transactionTypes.map((type) => (
              <SelectItem key={type.value || "all"} value={type.value || "all"}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label>Property Type</Label>
        <Select
          value={filters.propertyType}
          onValueChange={(v) => handleChange("propertyType", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value || "all"} value={type.value || "all"}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range</Label>
        <Select value={priceRangeKey} onValueChange={handlePriceRangeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Any Price" />
          </SelectTrigger>
          <SelectContent>
            {currentPriceRanges.map((range) => (
              <SelectItem key={range.value || "any"} value={range.value || "any"}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Province */}
      <div className="space-y-2">
        <Label>Province</Label>
        <Select
          value={filters.province}
          onValueChange={(v) => handleChange("province", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Provinces" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((prov) => (
              <SelectItem key={prov.value || "all"} value={prov.value || "all"}>
                {prov.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label>City</Label>
        <Select
          value={filters.city}
          onValueChange={(v) => handleChange("city", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            {currentCities.map((city) => (
              <SelectItem key={city.value || "all"} value={city.value || "all"}>
                {city.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bedrooms */}
      <div className="space-y-2">
        <Label>Bedrooms</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              type="number"
              placeholder="Min"
              min="0"
              value={filters.bedroomsMin}
              onChange={(e) => handleChange("bedroomsMin", e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max"
              min="0"
              value={filters.bedroomsMax}
              onChange={(e) => handleChange("bedroomsMax", e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
