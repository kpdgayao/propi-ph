import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get conversation with messages
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [
          { participant1Id: session.agentId },
          { participant2Id: session.agentId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            photo: true,
            phone: true,
            email: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            photo: true,
            phone: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            photos: true,
            price: true,
            city: true,
            province: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            senderId: true,
            readAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Get the other participant
    const otherParticipant =
      conversation.participant1Id === session.agentId
        ? conversation.participant2
        : conversation.participant1;

    return NextResponse.json({
      id: conversation.id,
      otherParticipant,
      property: conversation.property,
      messages: conversation.messages,
      currentUserId: session.agentId,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}
