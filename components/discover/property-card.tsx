"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Bed, Bath, Car, Maximize } from "lucide-react";

interface PropertyCardProps {
  property: {
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
    agent: {
      id: string;
      name: string;
      photo?: string | null;
    };
    similarity?: number;
  };
  showCoBroke?: boolean;
}

const propertyTypeLabels: Record<string, string> = {
  HOUSE: "House",
  CONDO: "Condo",
  TOWNHOUSE: "Townhouse",
  APARTMENT: "Apartment",
  LOT: "Lot",
  COMMERCIAL: "Commercial",
  WAREHOUSE: "Warehouse",
  FARM: "Farm",
};

export function PropertyCard({ property, showCoBroke = true }: PropertyCardProps) {
  const price = typeof property.price === "string"
    ? parseFloat(property.price)
    : property.price;

  const floorArea = property.floorArea
    ? typeof property.floorArea === "string"
      ? parseFloat(property.floorArea)
      : property.floorArea
    : null;

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group h-full cursor-pointer overflow-hidden transition-all hover:shadow-lg">
        {/* Photo */}
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          {property.photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.photos[0]}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No photo
            </div>
          )}
          {/* Transaction type badge */}
          <div className="absolute left-3 top-3">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                property.transactionType === "SALE"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              For {property.transactionType === "SALE" ? "Sale" : "Rent"}
            </span>
          </div>
        </div>

        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 overflow-hidden">
              <CardTitle className="line-clamp-1 text-base font-semibold">
                {property.title}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {property.barangay && `${property.barangay}, `}
                {property.city}, {property.province}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {/* Price */}
            <p className="text-xl font-bold text-primary">
              {formatPrice(price)}
              {property.transactionType === "RENT" && (
                <span className="text-sm font-normal text-gray-500">/mo</span>
              )}
            </p>

            {/* Property type */}
            <p className="text-sm text-gray-600">
              {propertyTypeLabels[property.propertyType] || property.propertyType}
            </p>

            {/* Specs */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              {property.bedrooms !== null && property.bedrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms !== null && property.bathrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              {property.carpark !== null && property.carpark !== undefined && (
                <div className="flex items-center gap-1">
                  <Car className="h-4 w-4" />
                  <span>{property.carpark}</span>
                </div>
              )}
              {floorArea !== null && (
                <div className="flex items-center gap-1">
                  <Maximize className="h-4 w-4" />
                  <span>{floorArea.toLocaleString()} sqm</span>
                </div>
              )}
            </div>

            {/* Co-broke info */}
            {showCoBroke && property.allowCoBroke && (
              <div className="rounded-md bg-blue-50 px-2 py-1.5">
                <p className="text-xs font-medium text-blue-700">
                  Co-broke: {Number(property.coBrokeSplit)}% split
                </p>
              </div>
            )}

            {/* Agent */}
            <div className="flex items-center gap-2 border-t pt-2">
              {property.agent.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={property.agent.photo}
                  alt={property.agent.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                  {property.agent.name.charAt(0)}
                </div>
              )}
              <p className="text-xs text-gray-500">{property.agent.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
