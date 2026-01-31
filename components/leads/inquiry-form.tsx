"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, CheckCircle } from "lucide-react";

interface InquiryFormProps {
  propertyId: string;
  propertyTitle: string;
}

export function InquiryForm({ propertyId, propertyTitle }: InquiryFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Hi, I'm interested in this property: ${propertyTitle}. Please contact me with more details.`
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          name,
          email,
          phone: phone || undefined,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send inquiry");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send inquiry");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex flex-col items-center py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
          <h3 className="mt-4 text-lg font-semibold text-green-900">
            Inquiry Sent!
          </h3>
          <p className="mt-2 text-sm text-green-700">
            The agent will contact you soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Inquire About This Property</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inquiry-name">Your Name</Label>
            <Input
              id="inquiry-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Dela Cruz"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inquiry-email">Email</Label>
            <Input
              id="inquiry-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inquiry-phone">Phone (Optional)</Label>
            <Input
              id="inquiry-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 917 123 4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inquiry-message">Message</Label>
            <Textarea
              id="inquiry-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              minLength={10}
              maxLength={2000}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Inquiry
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
