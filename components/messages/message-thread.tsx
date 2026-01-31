"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  Send,
  Loader2,
  ArrowLeft,
  Phone,
  Mail,
  Building,
  ExternalLink,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  readAt: string | null;
  createdAt: string;
}

interface Conversation {
  id: string;
  otherParticipant: {
    id: string;
    name: string;
    photo: string | null;
    phone: string;
    email: string;
  };
  property: {
    id: string;
    title: string;
    photos: string[];
    price: string;
    city: string;
    province: string;
  } | null;
  messages: Message[];
  currentUserId: string;
}

interface MessageThreadProps {
  conversation: Conversation;
  onBack: () => void;
  onMessageSent: () => void;
}

export function MessageThread({
  conversation,
  onBack,
  onMessageSent,
}: MessageThreadProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  // Mark as read when viewing
  useEffect(() => {
    fetch(`/api/conversations/${conversation.id}/read`, {
      method: "PATCH",
    }).catch(console.error);
  }, [conversation.id]);

  async function handleSend() {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(
        `/api/conversations/${conversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: message.trim() }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setMessage("");
      onMessageSent();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link
            href={`/agents/${conversation.otherParticipant.id}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            {conversation.otherParticipant.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={conversation.otherParticipant.photo}
                alt={conversation.otherParticipant.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600">
                {conversation.otherParticipant.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-medium">{conversation.otherParticipant.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <a
                  href={`tel:${conversation.otherParticipant.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Phone className="h-3 w-3" />
                  {conversation.otherParticipant.phone}
                </a>
              </div>
            </div>
          </Link>
        </div>

        {/* Property Context */}
        {conversation.property && (
          <Link
            href={`/properties/${conversation.property.id}`}
            className="mt-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
          >
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
              {conversation.property.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={conversation.property.photos[0]}
                  alt={conversation.property.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {conversation.property.title}
              </p>
              <p className="text-xs text-gray-500">
                {conversation.property.city}, {conversation.property.province}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" />
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {conversation.messages.map((msg) => {
            const isOwn = msg.senderId === conversation.currentUserId;
            return (
              <div
                key={msg.id}
                className={cn("flex", isOwn ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2",
                    isOwn
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      isOwn ? "text-primary-foreground/70" : "text-gray-500"
                    )}
                  >
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="min-h-[44px] resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            size="icon"
            className="h-11 w-11 flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
