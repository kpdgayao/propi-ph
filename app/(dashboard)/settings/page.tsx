"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, ExternalLink } from "lucide-react";

interface AgentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  bio: string | null;
  headline: string | null;
  yearsExperience: number | null;
  socialLinks: {
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  } | null;
  areasServed: string[];
  specializations: string[];
  prcLicense: string;
  defaultSplit: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [areasServed, setAreasServed] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [defaultSplit, setDefaultSplit] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/agents/me");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);

      // Initialize form state
      setName(data.name || "");
      setPhone(data.phone || "");
      setBio(data.bio || "");
      setHeadline(data.headline || "");
      setYearsExperience(data.yearsExperience?.toString() || "");
      setAreasServed(data.areasServed?.join(", ") || "");
      setSpecializations(data.specializations?.join(", ") || "");
      setDefaultSplit(data.defaultSplit?.toString() || "50");
      setFacebook(data.socialLinks?.facebook || "");
      setLinkedin(data.socialLinks?.linkedin || "");
      setInstagram(data.socialLinks?.instagram || "");
      setWebsite(data.socialLinks?.website || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/agents/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          bio: bio || undefined,
          headline: headline || undefined,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
          areasServed: areasServed
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          specializations: specializations
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          defaultSplit: parseFloat(defaultSplit) || 50,
          socialLinks: {
            facebook,
            linkedin,
            instagram,
            website,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your public profile and preferences
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email || ""} disabled />
              <p className="text-sm text-gray-500">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prcLicense">PRC License</Label>
              <Input
                id="prcLicense"
                value={profile?.prcLicense || ""}
                disabled
              />
              <p className="text-sm text-gray-500">
                License number cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Professional Headline</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Luxury Home Specialist in Baguio City"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell clients about yourself..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-sm text-gray-500">
                {bio.length}/1000 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="areasServed">Areas Served</Label>
              <Input
                id="areasServed"
                value={areasServed}
                onChange={(e) => setAreasServed(e.target.value)}
                placeholder="Baguio City, La Trinidad, Benguet"
              />
              <p className="text-sm text-gray-500">
                Separate multiple areas with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations</Label>
              <Input
                id="specializations"
                value={specializations}
                onChange={(e) => setSpecializations(e.target.value)}
                placeholder="Residential, Commercial, Land"
              />
              <p className="text-sm text-gray-500">
                Separate multiple specializations with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultSplit">Default Co-Broke Split (%)</Label>
              <Input
                id="defaultSplit"
                type="number"
                min="0"
                max="100"
                value={defaultSplit}
                onChange={(e) => setDefaultSplit(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Default commission split for co-brokerage deals
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/yourprofile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <a
            href={`/agents/${profile?.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ExternalLink className="h-4 w-4" />
            View Public Profile
          </a>
          <Button type="submit" disabled={saving}>
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
        </div>
      </form>
    </div>
  );
}
