"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ConversationList } from "@/components/messages/conversation-list";
import { MessageThread } from "@/components/messages/message-thread";
import { Loader2, MessageSquare } from "lucide-react";

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

interface ConversationDetail {
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
  messages: Array<{
    id: string;
    content: string;
    senderId: string;
    readAt: string | null;
    createdAt: string;
  }>;
  currentUserId: string;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationDetail | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        // Set current user ID from first conversation
        if (data.length > 0) {
          // Fetch current user ID
          const meRes = await fetch("/api/agents/me");
          if (meRes.ok) {
            const meData = await meRes.json();
            setCurrentUserId(meData.id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConversation = useCallback(async (id: string) => {
    setLoadingConversation(true);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedConversation(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    } finally {
      setLoadingConversation(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedId) {
      fetchConversation(selectedId);
    } else {
      setSelectedConversation(null);
    }
  }, [selectedId, fetchConversation]);

  function handleSelect(id: string) {
    router.push(`/messages?id=${id}`);
  }

  function handleBack() {
    router.push("/messages");
    setSelectedConversation(null);
  }

  function handleMessageSent() {
    // Refresh both lists
    fetchConversations();
    if (selectedId) {
      fetchConversation(selectedId);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)]">
      <Card className="flex h-full overflow-hidden">
        {/* Conversation List */}
        <div
          className={`w-full flex-shrink-0 overflow-y-auto border-r lg:w-80 ${
            selectedConversation ? "hidden lg:block" : "block"
          }`}
        >
          <div className="border-b p-4">
            <h2 className="font-semibold">Messages</h2>
          </div>
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelect}
            currentUserId={currentUserId}
          />
        </div>

        {/* Message Thread */}
        <div
          className={`flex-1 ${
            selectedConversation ? "block" : "hidden lg:block"
          }`}
        >
          {loadingConversation ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              onBack={handleBack}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageSquare className="h-12 w-12 text-gray-300" />
              <h3 className="mt-4 font-medium text-gray-900">
                Select a conversation
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-gray-600">Chat with other agents</p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        }
      >
        <MessagesContent />
      </Suspense>
    </div>
  );
}
