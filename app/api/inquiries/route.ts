import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createInquirySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// Create new inquiry (public)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createInquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { propertyId, name, email, phone, message } = parsed.data;

    // Get property and its agent
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, agentId: true, status: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Property is not available" },
        { status: 400 }
      );
    }

    // Check if logged-in agent is sending inquiry
    const session = await getSession();
    const inquiringAgentId = session?.agentId;

    // Don't allow agent to inquire on own property
    if (inquiringAgentId === property.agentId) {
      return NextResponse.json(
        { error: "Cannot inquire on your own property" },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        agentId: property.agentId,
        name,
        email,
        phone: phone || null,
        message,
        inquiringAgentId,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Inquiry sent successfully", inquiry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to send inquiry" },
      { status: 500 }
    );
  }
}

// List inquiries for authenticated agent
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      agentId: session.agentId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              photos: true,
              city: true,
              province: true,
              price: true,
            },
          },
          inquiringAgent: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ]);

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}
