"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ListingActionsProps {
  listingId: string;
  status: string;
  showDelete?: boolean;
}

export function ListingActions({ listingId, status, showDelete = false }: ListingActionsProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnlisting, setIsUnlisting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/listings/${listingId}/publish`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to publish listing");
      }

      toast({
        title: "Listing published",
        description: "Your listing is now live and visible to the public.",
      });

      router.refresh();
    } catch (error) {
      console.error("Publish error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to publish listing",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnlist = async () => {
    setIsUnlisting(true);
    try {
      const response = await fetch(`/api/listings/${listingId}/unlist`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to unlist listing");
      }

      toast({
        title: "Listing unlisted",
        description: "Your listing has been moved to drafts.",
      });

      router.refresh();
    } catch (error) {
      console.error("Unlist error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unlist listing",
        variant: "destructive",
      });
    } finally {
      setIsUnlisting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete listing");
      }

      toast({
        title: "Listing deleted",
        description: "Your listing has been permanently deleted.",
      });

      router.push("/listings");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete listing",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {status === "DRAFT" && (
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          size="sm"
        >
          {isPublishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            "Publish"
          )}
        </Button>
      )}
      {(status === "AVAILABLE" || status === "RESERVED") && (
        <Button
          onClick={handleUnlist}
          disabled={isUnlisting}
          variant="outline"
          size="sm"
        >
          {isUnlisting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Unlisting...
            </>
          ) : (
            "Unlist"
          )}
        </Button>
      )}
      {showDelete && status !== "SOLD" && status !== "RENTED" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-100"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this listing? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
