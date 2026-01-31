import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { updateInquirySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get single inquiry
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id, agentId: session.agentId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            photos: true,
            city: true,
            province: true,
            price: true,
            transactionType: true,
            propertyType: true,
          },
        },
        inquiringAgent: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            photo: true,
            prcLicense: true,
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiry" },
      { status: 500 }
    );
  }
}

// Update inquiry (status, notes)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateInquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.inquiry.findUnique({
      where: { id },
      select: { agentId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    if (existing.agentId !== session.agentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data: Record<string, unknown> = {};

    if (parsed.data.status) {
      data.status = parsed.data.status;
      // Set contactedAt when first moving from NEW
      if (parsed.data.status !== "NEW") {
        const inquiry = await prisma.inquiry.findUnique({
          where: { id },
          select: { contactedAt: true, status: true },
        });
        if (inquiry?.status === "NEW" && !inquiry.contactedAt) {
          data.contactedAt = new Date();
        }
      }
    }

    if (parsed.data.notes !== undefined) {
      data.notes = parsed.data.notes;
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data,
      include: {
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}
