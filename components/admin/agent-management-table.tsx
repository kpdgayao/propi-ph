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
import { toast } from "@/hooks/use-toast";
import {
  Search,
  CheckCircle,
  XCircle,
  MoreVertical,
  Building,
  ChevronLeft,
  ChevronRight,
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

const filters = [
  { value: "", label: "All Agents" },
  { value: "pending", label: "Pending Verification" },
  { value: "verified", label: "Verified" },
  { value: "inactive", label: "Inactive" },
];

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

  const updateAgentStatus = async (
    agentId: string,
    data: { isActive?: boolean; isVerified?: boolean }
  ) => {
    setIsUpdating(agentId);
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update agent");
      }

      toast({
        title: "Agent updated",
        description: "Agent status has been updated successfully",
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
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
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
              className="w-64"
            />
            <Button type="submit" size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>PRC License</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
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
                        {agent.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={agent.photo}
                            alt={agent.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                            {agent.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-gray-500">{agent.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {agent.prcLicense}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Building className="h-4 w-4" />
                        {agent._count.listings}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {agent.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                            <XCircle className="h-4 w-4" />
                            Pending
                          </span>
                        )}
                        {!agent.isActive && (
                          <span className="text-xs text-red-600">Inactive</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
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
                              onClick={() =>
                                updateAgentStatus(agent.id, { isVerified: true })
                              }
                              className="text-green-600"
                            >
                              Verify Agent
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                updateAgentStatus(agent.id, { isVerified: false })
                              }
                              className="text-yellow-600"
                            >
                              Revoke Verification
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {agent.isActive ? (
                            <DropdownMenuItem
                              onClick={() =>
                                updateAgentStatus(agent.id, { isActive: false })
                              }
                              className="text-red-600"
                            >
                              Suspend Agent
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                updateAgentStatus(agent.id, { isActive: true })
                              }
                              className="text-green-600"
                            >
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
          <div className="mt-4 flex items-center justify-between">
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
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
