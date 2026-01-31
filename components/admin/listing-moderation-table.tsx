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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle,
  XCircle,
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

interface ConfirmDialogState {
  open: boolean;
  listingId: string | null;
  listingTitle: string;
  action: "feature" | "unfeature" | "flag" | "unflag" | "takedown" | "restore" | null;
}

const filters = [
  { value: "", label: "All Listings" },
  { value: "available", label: "Available" },
  { value: "featured", label: "Featured" },
  { value: "flagged", label: "Flagged" },
  { value: "unlisted", label: "Unlisted" },
];

const actionConfig = {
  feature: {
    title: "Feature Listing",
    description: "This listing will be prominently displayed on the homepage and search results.",
    confirmText: "Feature Listing",
    variant: "default" as const,
  },
  unfeature: {
    title: "Remove from Featured",
    description: "This listing will no longer appear in featured sections.",
    confirmText: "Remove from Featured",
    variant: "default" as const,
  },
  flag: {
    title: "Flag for Review",
    description: "This listing will be marked for review. The agent will be notified.",
    confirmText: "Flag Listing",
    variant: "destructive" as const,
  },
  unflag: {
    title: "Clear Flag",
    description: "This listing will no longer be flagged for review.",
    confirmText: "Clear Flag",
    variant: "default" as const,
  },
  takedown: {
    title: "Take Down Listing",
    description: "This listing will be unlisted and no longer visible to the public. The agent can re-list it later.",
    confirmText: "Take Down",
    variant: "destructive" as const,
  },
  restore: {
    title: "Restore Listing",
    description: "This listing will be made available again to the public.",
    confirmText: "Restore Listing",
    variant: "default" as const,
  },
};

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
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    listingId: null,
    listingTitle: "",
    action: null,
  });

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

  const openConfirmDialog = (
    listingId: string,
    listingTitle: string,
    action: ConfirmDialogState["action"]
  ) => {
    setConfirmDialog({ open: true, listingId, listingTitle, action });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, listingId: null, listingTitle: "", action: null });
  };

  const executeAction = async () => {
    if (!confirmDialog.listingId || !confirmDialog.action) return;

    const actionData: Record<string, { isFeatured?: boolean; isFlagged?: boolean; status?: string; flagReason?: string }> = {
      feature: { isFeatured: true },
      unfeature: { isFeatured: false },
      flag: { isFlagged: true, flagReason: "Flagged by admin for review" },
      unflag: { isFlagged: false },
      takedown: { status: "UNLISTED" },
      restore: { status: "AVAILABLE" },
    };

    setIsUpdating(confirmDialog.listingId);
    try {
      const res = await fetch(`/api/admin/listings/${confirmDialog.listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actionData[confirmDialog.action]),
      });

      if (!res.ok) {
        throw new Error("Failed to moderate listing");
      }

      const actionMessages = {
        feature: "featured",
        unfeature: "removed from featured",
        flag: "flagged for review",
        unflag: "flag cleared",
        takedown: "taken down",
        restore: "restored",
      };

      toast({
        title: "Listing updated",
        description: `Listing has been ${actionMessages[confirmDialog.action]} successfully`,
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
      closeConfirmDialog();
    }
  };

  const config = confirmDialog.action ? actionConfig[confirmDialog.action] : null;

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
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
                className="w-full sm:w-64"
              />
              <Button type="submit" size="icon" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead className="hidden md:table-cell">Agent</TableHead>
                  <TableHead className="hidden sm:table-cell">Price</TableHead>
                  <TableHead className="hidden lg:table-cell">Views</TableHead>
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
                              className="h-12 w-16 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded bg-gray-200 text-xs text-gray-400">
                              No img
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">{listing.title}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {listing.city}, {listing.province}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="text-sm font-medium">{listing.agent.name}</p>
                          {listing.agent.isVerified && (
                            <Badge variant="success" className="text-xs mt-1">Verified</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden font-medium sm:table-cell">
                        {formatPrice(listing.price)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="h-4 w-4" />
                          {listing.viewCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant={
                              listing.status === "AVAILABLE"
                                ? "success"
                                : listing.status === "UNLISTED"
                                ? "muted"
                                : "info"
                            }
                          >
                            {listing.status}
                          </Badge>
                          {listing.isFeatured && (
                            <Badge variant="warning" className="gap-1">
                              <Star className="h-3 w-3" />
                              Featured
                            </Badge>
                          )}
                          {listing.isFlagged && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Flagged
                            </Badge>
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
                                onClick={() => openConfirmDialog(listing.id, listing.title, "feature")}
                                className="text-yellow-600"
                              >
                                <Star className="mr-2 h-4 w-4" />
                                Feature Listing
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(listing.id, listing.title, "unfeature")}
                              >
                                <Star className="mr-2 h-4 w-4" />
                                Remove from Featured
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {!listing.isFlagged ? (
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(listing.id, listing.title, "flag")}
                                className="text-red-600"
                              >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Flag for Review
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(listing.id, listing.title, "unflag")}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Clear Flag
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {listing.status === "AVAILABLE" ? (
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(listing.id, listing.title, "takedown")}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Take Down Listing
                              </DropdownMenuItem>
                            ) : listing.status === "UNLISTED" ? (
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(listing.id, listing.title, "restore")}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
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
            <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
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
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && closeConfirmDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{config?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-gray-900 block truncate">{confirmDialog.listingTitle}</span>
              <br />
              {config?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              className={config?.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {config?.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
