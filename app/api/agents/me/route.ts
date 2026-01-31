import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: session.agentId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        photo: true,
        bio: true,
        headline: true,
        yearsExperience: true,
        socialLinks: true,
        areasServed: true,
        specializations: true,
        prcLicense: true,
        defaultSplit: true,
        createdAt: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Clean empty strings from socialLinks
    if (data.socialLinks) {
      const cleanedLinks: Record<string, string> = {};
      for (const [key, value] of Object.entries(data.socialLinks)) {
        if (value && value.trim() !== "") {
          cleanedLinks[key] = value;
        }
      }
      data.socialLinks = Object.keys(cleanedLinks).length > 0 ? cleanedLinks : undefined;
    }

    const agent = await prisma.agent.update({
      where: { id: session.agentId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        photo: true,
        bio: true,
        headline: true,
        yearsExperience: true,
        socialLinks: true,
        areasServed: true,
        specializations: true,
        prcLicense: true,
        defaultSplit: true,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
