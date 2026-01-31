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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  MoreVertical,
  Building,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  prcLicense: string;
  photo: string | null;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  _count: {
    listings: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AgentManagementTableProps {
  agents: Agent[];
  pagination: Pagination;
  currentFilter?: string;
  currentSearch?: string;
}

interface ConfirmDialogState {
  open: boolean;
  agentId: string | null;
  agentName: string;
  action: "verify" | "revoke" | "suspend" | "reactivate" | null;
}

const filters = [
  { value: "", label: "All Agents" },
  { value: "pending", label: "Pending Verification" },
  { value: "verified", label: "Verified" },
  { value: "inactive", label: "Inactive" },
];

const actionConfig = {
  verify: {
    title: "Verify Agent",
    description: "Are you sure you want to verify this agent? They will be able to list properties on the platform.",
    confirmText: "Verify Agent",
    variant: "default" as const,
  },
  revoke: {
    title: "Revoke Verification",
    description: "Are you sure you want to revoke this agent's verification? Their listings will remain but they will be marked as unverified.",
    confirmText: "Revoke Verification",
    variant: "default" as const,
  },
  suspend: {
    title: "Suspend Agent",
    description: "Are you sure you want to suspend this agent? They will not be able to access their account or manage listings.",
    confirmText: "Suspend Agent",
    variant: "destructive" as const,
  },
  reactivate: {
    title: "Reactivate Agent",
    description: "Are you sure you want to reactivate this agent? They will regain access to their account.",
    confirmText: "Reactivate Agent",
    variant: "default" as const,
  },
};

export function AgentManagementTable({
  agents,
  pagination,
  currentFilter,
  currentSearch,
}: AgentManagementTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || "");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    agentId: null,
    agentName: "",
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
    router.push(`/admin/agents?${newParams.toString()}`);
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
    agentId: string,
    agentName: string,
    action: ConfirmDialogState["action"]
  ) => {
    setConfirmDialog({ open: true, agentId, agentName, action });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, agentId: null, agentName: "", action: null });
  };

  const executeAction = async () => {
    if (!confirmDialog.agentId || !confirmDialog.action) return;

    const actionData: Record<string, { isActive?: boolean; isVerified?: boolean }> = {
      verify: { isVerified: true },
      revoke: { isVerified: false },
      suspend: { isActive: false },
      reactivate: { isActive: true },
    };

    setIsUpdating(confirmDialog.agentId);
    try {
      const res = await fetch(`/api/admin/agents/${confirmDialog.agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actionData[confirmDialog.action]),
      });

      if (!res.ok) {
        throw new Error("Failed to update agent");
      }

      toast({
        title: "Agent updated",
        description: `Agent has been ${confirmDialog.action === "verify" ? "verified" : confirmDialog.action === "revoke" ? "unverified" : confirmDialog.action === "suspend" ? "suspended" : "reactivated"} successfully`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agent status",
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
                placeholder="Search agents..."
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
                  <TableHead>Agent</TableHead>
                  <TableHead className="hidden sm:table-cell">PRC License</TableHead>
                  <TableHead className="hidden md:table-cell">Listings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No agents found
                    </TableCell>
                  </TableRow>
                ) : (
                  agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={agent.photo || undefined} alt={agent.name} />
                            <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{agent.name}</p>
                            <p className="text-sm text-gray-500 truncate">{agent.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden font-mono text-sm sm:table-cell">
                        {agent.prcLicense}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Building className="h-4 w-4" />
                          {agent._count.listings}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {agent.isVerified ? (
                            <Badge variant="success" className="gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="gap-1 w-fit">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                          {!agent.isActive && (
                            <Badge variant="destructive" className="gap-1 w-fit">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm text-gray-500 lg:table-cell">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isUpdating === agent.id}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/agents/${agent.id}`} target="_blank">
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!agent.isVerified ? (
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(agent.id, agent.name, "verify")}
                                className="text-green-600"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Verify Agent
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(agent.id, agent.name, "revoke")}
                                className="text-yellow-600"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Revoke Verification
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {agent.isActive ? (
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(agent.id, agent.name, "suspend")}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Suspend Agent
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(agent.id, agent.name, "reactivate")}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Reactivate Agent
                              </DropdownMenuItem>
                            )}
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
                {pagination.total} agents
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
              <span className="font-medium text-gray-900">{confirmDialog.agentName}</span>
              <br />
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
