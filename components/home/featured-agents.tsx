import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Home } from "lucide-react";

async function getTopAgents() {
  try {
    const agents = await prisma.agent.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        photo: true,
        _count: {
          select: {
            listings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    });

    return agents;
  } catch (error) {
    console.error("Failed to fetch top agents:", error);
    return [];
  }
}

export async function FeaturedAgents() {
  const agents = await getTopAgents();

  if (agents.length === 0) return null;

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Our Team
            </span>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Meet Our Agents
            </h2>
            <p className="mt-2 text-gray-600">
              Licensed professionals ready to help you
            </p>
          </div>
          <Link href="/agents" className="hidden sm:block">
            <Button variant="outline">
              View All Agents
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.id}`}>
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                <CardContent className="p-6 text-center">
                  {/* Avatar */}
                  <div className="mx-auto mb-4 relative">
                    {agent.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={agent.photo}
                        alt={agent.name}
                        className="h-24 w-24 rounded-full object-cover mx-auto ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-2xl font-bold mx-auto ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all">
                        {getInitials(agent.name)}
                      </div>
                    )}
                    {/* Online indicator */}
                    <span className="absolute bottom-1 right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>

                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary transition-colors">
                    {agent.name}
                  </h3>

                  <div className="mt-2 flex items-center justify-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>Northern Luzon</span>
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-1 text-sm text-primary font-medium">
                    <Home className="h-4 w-4" />
                    <span>{agent._count.listings} Active Listings</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full group-hover:bg-primary group-hover:text-white transition-colors"
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/agents">
            <Button variant="outline">
              View All Agents
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
