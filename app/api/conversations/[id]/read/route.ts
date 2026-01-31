import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Mark messages as read
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [
          { participant1Id: session.agentId },
          { participant2Id: session.agentId },
        ],
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Mark all unread messages from the other person as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.agentId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
