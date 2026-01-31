"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowLeft,
  Phone,
  Mail,
  Building,
  Calendar,
  Save,
  ExternalLink,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  notes: string | null;
  createdAt: string;
  contactedAt: string | null;
  property: {
    id: string;
    title: string;
    photos: string[];
    city: string;
    province: string;
    price: string;
    transactionType: string;
    propertyType: string;
  };
  inquiringAgent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    photo: string | null;
    prcLicense: string;
  } | null;
}

const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "VIEWING_SCHEDULED", label: "Viewing Scheduled" },
  { value: "NEGOTIATING", label: "Negotiating" },
  { value: "CONVERTED", label: "Converted" },
  { value: "CLOSED", label: "Closed" },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LeadDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchInquiry();
  }, [id]);

  async function fetchInquiry() {
    try {
      const res = await fetch(`/api/inquiries/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch inquiry");
      }
      const data = await res.json();
      setInquiry(data);
      setStatus(data.status);
      setNotes(data.notes || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inquiry");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      if (!res.ok) {
        throw new Error("Failed to update inquiry");
      }

      const updated = await res.json();
      setInquiry((prev) => (prev ? { ...prev, ...updated } : null));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-medium">Inquiry not found</h2>
        <Link href="/leads" className="mt-2 text-primary hover:underline">
          Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/leads"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to leads
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{inquiry.name}</CardTitle>
                    {inquiry.inquiringAgent && (
                      <span className="flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                        <UserCheck className="h-3 w-3" />
                        Agent
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Inquired on{" "}
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <LeadStatusBadge status={inquiry.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <a
                  href={`mailto:${inquiry.email}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {inquiry.email}
                </a>
                {inquiry.phone && (
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {inquiry.phone}
                  </a>
                )}
              </div>

              {inquiry.inquiringAgent && (
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="text-sm font-medium text-purple-900">
                    Co-Broker Inquiry
                  </p>
                  <p className="mt-1 text-sm text-purple-700">
                    {inquiry.inquiringAgent.name} • PRC License:{" "}
                    {inquiry.inquiringAgent.prcLicense}
                  </p>
                  <Link
                    href={`/agents/${inquiry.inquiringAgent.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm text-purple-600 hover:underline"
                  >
                    View Profile
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-gray-700">
                {inquiry.message}
              </p>
            </CardContent>
          </Card>

          {/* Status & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
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

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Property Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/properties/${inquiry.property.id}`}
                className="block"
              >
                <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                  {inquiry.property.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={inquiry.property.photos[0]}
                      alt={inquiry.property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Building className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <h3 className="mt-3 font-semibold hover:text-primary">
                  {inquiry.property.title}
                </h3>
              </Link>
              <p className="mt-1 text-sm text-gray-500">
                {inquiry.property.city}, {inquiry.property.province}
              </p>
              <p className="mt-2 text-lg font-bold text-primary">
                {formatPrice(Number(inquiry.property.price))}
                {inquiry.property.transactionType === "RENT" && (
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                )}
              </p>
              <Link
                href={`/properties/${inquiry.property.id}`}
                className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View Property
                <ExternalLink className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="font-medium">Inquiry Received</p>
                    <p className="text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {inquiry.contactedAt && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">First Contact</p>
                      <p className="text-gray-500">
                        {new Date(inquiry.contactedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
