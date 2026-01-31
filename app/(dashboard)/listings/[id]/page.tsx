import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ListingForm } from "@/components/listings/listing-form";
import { PhotoUpload } from "@/components/listings/photo-upload";
import { ListingActions } from "@/components/listings/listing-actions";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: PageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const listing = await prisma.property.findUnique({
    where: { id },
  });

  if (!listing) {
    notFound();
  }

  // Only owner can edit
  if (listing.agentId !== session.agentId) {
    redirect("/listings");
  }

  const initialData = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    propertyType: listing.propertyType,
    transactionType: listing.transactionType,
    price: Number(listing.price),
    province: listing.province,
    city: listing.city,
    barangay: listing.barangay || "",
    address: listing.address || "",
    landmark: listing.landmark || "",
    bedrooms: listing.bedrooms || undefined,
    bathrooms: listing.bathrooms || undefined,
    carpark: listing.carpark || undefined,
    lotArea: listing.lotArea ? Number(listing.lotArea) : undefined,
    floorArea: listing.floorArea ? Number(listing.floorArea) : undefined,
    floors: listing.floors || undefined,
    yearBuilt: listing.yearBuilt || undefined,
    features: listing.features,
    furnishing: listing.furnishing || "",
    allowCoBroke: listing.allowCoBroke,
    coBrokeSplit: Number(listing.coBrokeSplit),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/listings"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to Listings
          </Link>
        </div>

        <ListingActions listingId={listing.id} status={listing.status} />
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
          <p className="text-gray-600">
            {listing.title} &bull; {formatPrice(Number(listing.price))}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            listing.status === "AVAILABLE"
              ? "bg-green-100 text-green-700"
              : listing.status === "DRAFT"
              ? "bg-gray-100 text-gray-700"
              : listing.status === "SOLD" || listing.status === "RENTED"
              ? "bg-blue-100 text-blue-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {listing.status}
        </span>
      </div>

      {/* Photo upload section */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 font-medium">Photos</h3>
        <PhotoUpload
          listingId={listing.id}
          initialPhotos={listing.photos}
        />
      </div>

      <ListingForm initialData={initialData} mode="edit" />

      {/* Danger Zone */}
      {listing.status !== "SOLD" && listing.status !== "RENTED" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="mb-2 font-medium text-red-800">Danger Zone</h3>
          <p className="mb-4 text-sm text-red-600">
            Once you delete a listing, there is no going back.
          </p>
          <ListingActions listingId={listing.id} status={listing.status} showDelete />
        </div>
      )}
    </div>
  );
}
