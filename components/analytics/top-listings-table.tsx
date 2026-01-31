import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Eye, Inbox } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface TopListing {
  id: string;
  title: string;
  views: number;
  inquiries: number;
  photo: string | null;
  price: string;
  location: string;
}

interface TopListingsTableProps {
  listings: TopListing[];
}

export function TopListingsTable({ listings }: TopListingsTableProps) {
  if (listings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building className="h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">No listings yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Listings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {listings.map((listing, index) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-gray-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                {index + 1}
              </span>
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {listing.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.photo}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Building className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{listing.title}</p>
                <p className="text-sm text-gray-500">{listing.location}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {listing.views}
                </span>
                <span className="flex items-center gap-1">
                  <Inbox className="h-4 w-4" />
                  {listing.inquiries}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
