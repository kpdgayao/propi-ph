"use client";

import Link from "next/link";
import { Home, Building2, Building, Warehouse, Trees, Store } from "lucide-react";

const PROPERTY_TYPES = [
  {
    type: "HOUSE",
    label: "Houses",
    icon: Home,
    description: "Single-family homes",
    gradient: "from-emerald-500 to-teal-600"
  },
  {
    type: "CONDO",
    label: "Condos",
    icon: Building2,
    description: "Condominium units",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    type: "TOWNHOUSE",
    label: "Townhouses",
    icon: Building,
    description: "Multi-story attached",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    type: "LOT",
    label: "Lots & Land",
    icon: Trees,
    description: "Vacant lots & farms",
    gradient: "from-amber-500 to-orange-600"
  },
  {
    type: "COMMERCIAL",
    label: "Commercial",
    icon: Store,
    description: "Business spaces",
    gradient: "from-rose-500 to-red-600"
  },
  {
    type: "WAREHOUSE",
    label: "Warehouse",
    icon: Warehouse,
    description: "Storage & industrial",
    gradient: "from-slate-500 to-gray-600"
  },
];

export function PropertyTypes() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            What are you looking for?
          </h2>
          <p className="mt-2 text-gray-600">
            Browse properties by type
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {PROPERTY_TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.type}
                href={`/discover?propertyType=${item.type}`}
                className="group relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-10 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10">
                  <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 group-hover:text-white/80 transition-colors duration-300">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
