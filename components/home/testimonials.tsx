"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Maria Santos",
    location: "Camp John Hay, Baguio",
    role: "Homeowner",
    image: null, // Will use initials
    rating: 5,
    text: "TowerHomes made our dream of owning a home in Baguio a reality. Their team's local expertise and dedication helped us find the perfect property within our budget. Highly recommended!",
  },
  {
    id: 2,
    name: "Roberto Cruz",
    location: "San Fernando, La Union",
    role: "Property Investor",
    image: null,
    rating: 5,
    text: "As an investor, I appreciate their professionalism and market knowledge. They helped me acquire multiple properties in La Union with excellent returns. A trustworthy partner.",
  },
  {
    id: 3,
    name: "Ana Reyes",
    location: "Session Road, Baguio",
    role: "Business Owner",
    image: null,
    rating: 5,
    text: "Found the perfect commercial space for my cafe through TowerHomes. Their understanding of the Baguio market and quick response time made the whole process smooth.",
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            What Our Clients Say
          </h2>
          <p className="mt-2 text-gray-600">
            Real stories from satisfied homeowners and investors
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full shadow-lg hidden md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full shadow-lg hidden md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Testimonial Card */}
          <Card className="border-0 shadow-xl bg-white overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                {/* Quote Icon */}
                <div className="mb-6 p-4 bg-primary/10 rounded-full">
                  <Quote className="h-8 w-8 text-primary" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(TESTIMONIALS[activeIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 max-w-2xl">
                  &ldquo;{TESTIMONIALS[activeIndex].text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(TESTIMONIALS[activeIndex].name)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      {TESTIMONIALS[activeIndex].name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {TESTIMONIALS[activeIndex].role} &bull; {TESTIMONIALS[activeIndex].location}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-4 mt-4 md:hidden">
            <Button variant="outline" size="sm" onClick={prevTestimonial}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={nextTestimonial}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
