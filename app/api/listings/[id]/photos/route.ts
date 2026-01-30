import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import {
  uploadFile,
  deleteFile,
  getKeyFromUrl,
  isValidImageType,
  MAX_FILE_SIZE,
  MAX_PHOTOS_PER_LISTING,
} from "@/lib/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/listings/[id]/photos - Upload photos
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Check ownership
    const listing = await prisma.property.findUnique({
      where: { id },
      select: { agentId: true, photos: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.agentId !== session.agentId) {
      return NextResponse.json(
        { error: "You can only upload photos to your own listings" },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();

    // Debug: log all form data keys
    const allKeys = Array.from(formData.keys());
    console.log("Form data keys:", allKeys);

    // Try both "photos" and "file" field names
    let files = formData.getAll("photos") as File[];
    if (!files || files.length === 0) {
      files = formData.getAll("file") as File[];
    }

    // Also try getting a single file
    if (!files || files.length === 0) {
      const singleFile = formData.get("photos") || formData.get("file");
      if (singleFile && singleFile instanceof File) {
        files = [singleFile];
      }
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided", debug: { keys: allKeys } },
        { status: 400 }
      );
    }

    console.log("Files received:", files.length, files.map(f => ({ name: f.name, type: f.type, size: f.size })));

    // Check total photo limit
    const currentCount = listing.photos.length;
    if (currentCount + files.length > MAX_PHOTOS_PER_LISTING) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_PHOTOS_PER_LISTING} photos allowed. You have ${currentCount} photos.`,
        },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!isValidImageType(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only images allowed.`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large. Maximum 10MB.`);
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadFile(
          buffer,
          file.name,
          file.type,
          `listings/${id}`
        );
        uploadedUrls.push(result.url);
      } catch (uploadError) {
        const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError);
        console.error(`Failed to upload ${file.name}:`, errorMessage, uploadError);
        errors.push(`${file.name}: Upload failed - ${errorMessage}`);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "No files were uploaded", details: errors },
        { status: 400 }
      );
    }

    // Update listing with new photo URLs
    const updatedListing = await prisma.property.update({
      where: { id },
      data: {
        photos: [...listing.photos, ...uploadedUrls],
      },
      select: { photos: true },
    });

    return NextResponse.json({
      message: `${uploadedUrls.length} photo(s) uploaded successfully`,
      photos: updatedListing.photos,
      uploaded: uploadedUrls,
      ...(errors.length > 0 && { warnings: errors }),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Upload photos error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id]/photos - Delete a photo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const { photoUrl } = await request.json();

    if (!photoUrl) {
      return NextResponse.json(
        { error: "photoUrl is required" },
        { status: 400 }
      );
    }

    // Check ownership
    const listing = await prisma.property.findUnique({
      where: { id },
      select: { agentId: true, photos: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.agentId !== session.agentId) {
      return NextResponse.json(
        { error: "You can only delete photos from your own listings" },
        { status: 403 }
      );
    }

    // Check if photo exists in listing
    if (!listing.photos.includes(photoUrl)) {
      return NextResponse.json(
        { error: "Photo not found in this listing" },
        { status: 404 }
      );
    }

    // Delete from R2
    const key = getKeyFromUrl(photoUrl);
    if (key) {
      try {
        await deleteFile(key);
      } catch (deleteError) {
        console.error("Failed to delete from R2:", deleteError);
        // Continue to remove from database even if R2 delete fails
      }
    }

    // Remove from listing
    const updatedPhotos = listing.photos.filter((p) => p !== photoUrl);
    const updatedListing = await prisma.property.update({
      where: { id },
      data: { photos: updatedPhotos },
      select: { photos: true },
    });

    return NextResponse.json({
      message: "Photo deleted successfully",
      photos: updatedListing.photos,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Delete photo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
