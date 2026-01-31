"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Bell, CheckCircle, Loader2 } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    // Simulate API call - in production, this would connect to a newsletter service
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubscribed(true);
    setEmail("");

    toast({
      title: "Successfully subscribed!",
      description: "You'll receive property alerts matching your interests.",
    });
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary via-primary to-green-700">
      <div className="mx-auto max-w-7xl px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-6">
            <Bell className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Never Miss a Listing
          </h2>
          <p className="mt-3 text-lg text-white/80">
            Get notified when new properties match your criteria in Baguio and Northern Luzon
          </p>

          {isSubscribed ? (
            <div className="mt-8 flex items-center justify-center gap-3 text-white">
              <CheckCircle className="h-6 w-6 text-green-300" />
              <span className="text-lg">Thank you for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 bg-white/95 border-0 text-gray-900 placeholder:text-gray-500"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="h-12 px-8 whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </div>
              <p className="mt-3 text-sm text-white/60">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
