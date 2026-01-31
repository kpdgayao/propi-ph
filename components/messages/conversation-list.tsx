"use client";

import { cn } from "@/lib/utils";
import { Building, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  otherParticipant: {
    id: string;
    name: string;
    photo: string | null;
  };
  property: {
    id: string;
    title: string;
    photos: string[];
  } | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  currentUserId: string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  currentUserId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <MessageSquare className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 font-medium text-gray-900">No messages yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start a conversation from a property or agent page
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conv) => {
        const isSelected = conv.id === selectedId;
        const hasUnread = conv.unreadCount > 0;
        const isOwnMessage = conv.lastMessage?.senderId === currentUserId;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50",
              isSelected && "bg-primary/5"
            )}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {conv.otherParticipant.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={conv.otherParticipant.photo}
                  alt={conv.otherParticipant.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-medium text-gray-600">
                  {conv.otherParticipant.name.charAt(0)}
                </div>
              )}
              {hasUnread && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "truncate font-medium",
                    hasUnread && "text-gray-900"
                  )}
                >
                  {conv.otherParticipant.name}
                </p>
                {conv.lastMessageAt && (
                  <span className="flex-shrink-0 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conv.lastMessageAt), {
                      addSuffix: false,
                    })}
                  </span>
                )}
              </div>

              {conv.property && (
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                  <Building className="h-3 w-3" />
                  {conv.property.title}
                </p>
              )}

              {conv.lastMessage && (
                <p
                  className={cn(
                    "mt-1 truncate text-sm",
                    hasUnread ? "font-medium text-gray-900" : "text-gray-500"
                  )}
                >
                  {isOwnMessage && "You: "}
                  {conv.lastMessage.content}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
