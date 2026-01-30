import Link from "next/link";
import { ListingForm } from "@/components/listings/listing-form";

export const dynamic = "force-dynamic";

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/listings"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Listings
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
        <p className="text-gray-600">
          Fill in the details below to create your property listing
        </p>
      </div>

      <ListingForm mode="create" />
    </div>
  );
}
