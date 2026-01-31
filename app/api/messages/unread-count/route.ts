import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: session.agentId },
          { participant2Id: session.agentId },
        ],
      },
      select: { id: true },
    });

    const conversationIds = conversations.map((c) => c.id);

    // Count unread messages not sent by current user
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: session.agentId },
        readAt: null,
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
