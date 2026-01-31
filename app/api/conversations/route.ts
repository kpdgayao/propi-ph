import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createConversationSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// List conversations
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
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
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            photos: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            readAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
    });

    // Count unread messages per conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: session.agentId },
            readAt: null,
          },
        });

        // Get the other participant
        const otherParticipant =
          conv.participant1Id === session.agentId
            ? conv.participant2
            : conv.participant1;

        return {
          id: conv.id,
          otherParticipant,
          property: conv.property,
          lastMessage: conv.messages[0] || null,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
        };
      })
    );

    return NextResponse.json(conversationsWithUnread);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// Start new conversation
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createConversationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { participantId, propertyId, initialMessage } = parsed.data;

    // Can't message yourself
    if (participantId === session.agentId) {
      return NextResponse.json(
        { error: "Cannot start conversation with yourself" },
        { status: 400 }
      );
    }

    // Check if participant exists
    const participant = await prisma.agent.findUnique({
      where: { id: participantId },
      select: { id: true },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: session.agentId,
            participant2Id: participantId,
            propertyId: propertyId || null,
          },
          {
            participant1Id: participantId,
            participant2Id: session.agentId,
            propertyId: propertyId || null,
          },
        ],
      },
    });

    if (existingConversation) {
      // Add message to existing conversation
      await prisma.message.create({
        data: {
          conversationId: existingConversation.id,
          senderId: session.agentId,
          content: initialMessage,
        },
      });

      await prisma.conversation.update({
        where: { id: existingConversation.id },
        data: { lastMessageAt: new Date() },
      });

      return NextResponse.json({ conversationId: existingConversation.id });
    }

    // Create new conversation with initial message
    const conversation = await prisma.conversation.create({
      data: {
        participant1Id: session.agentId,
        participant2Id: participantId,
        propertyId: propertyId || null,
        lastMessageAt: new Date(),
        messages: {
          create: {
            senderId: session.agentId,
            content: initialMessage,
          },
        },
      },
    });

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
