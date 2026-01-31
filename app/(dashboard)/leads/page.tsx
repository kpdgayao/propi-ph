"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import {
  Loader2,
  Inbox,
  Phone,
  Mail,
  Building,
  Calendar,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
  contactedAt: string | null;
  property: {
    id: string;
    title: string;
    photos: string[];
    city: string;
    province: string;
    price: string;
  };
  inquiringAgent: {
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null;
}

const statusOptions = [
  { value: "all", label: "All Leads" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "VIEWING_SCHEDULED", label: "Viewing Scheduled" },
  { value: "NEGOTIATING", label: "Negotiating" },
  { value: "CONVERTED", label: "Converted" },
  { value: "CLOSED", label: "Closed" },
];

export default function LeadsPage() {
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [status, setStatus] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchInquiries();
  }, [status]);

  async function fetchInquiries(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (status !== "all") {
        params.set("status", status);
      }

      const res = await fetch(`/api/inquiries?${params}`);
      const data = await res.json();

      setInquiries(data.inquiries || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error("Failed to fetch inquiries:", error);
    } finally {
      setLoading(false);
    }
  }

  const newCount = inquiries.filter((i) => i.status === "NEW").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-gray-600">
            Manage inquiries from potential buyers and co-brokers
          </p>
        </div>
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {newCount} new
            </span>
          )}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : inquiries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No leads yet
            </h3>
            <p className="mt-2 text-gray-500">
              When someone inquires about your properties, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Link key={inquiry.id} href={`/leads/${inquiry.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Property Thumbnail */}
                    <div className="hidden h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block">
                      {inquiry.property.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={inquiry.property.photos[0]}
                          alt={inquiry.property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Building className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{inquiry.name}</h3>
                            {inquiry.inquiringAgent && (
                              <span className="flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                                <UserCheck className="h-3 w-3" />
                                Agent
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                            {inquiry.property.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <LeadStatusBadge status={inquiry.status} />
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {inquiry.message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {inquiry.email}
                        </span>
                        {inquiry.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {inquiry.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchInquiries(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchInquiries(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
