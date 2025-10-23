import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import {
  MY_ROOMS_QUERY,
  MESSAGES_QUERY,
  SEND_MESSAGE_MUTATION,
  MESSAGE_ADDED_SUBSCRIPTION,
} from "../graphql/operations";
import { useAuth } from "../hooks/useAuth";
import { ChatSidebar } from "./ChatSidebar";
import { ChatArea } from "./ChatArea";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

interface Room {
  id: string;
  name: string;
  description?: string;
}

export const Chat = () => {
  const { user } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // GraphQL Queries: Fetch user's rooms and messages for selected room
  const { data: roomsData, loading: roomsLoading } = useQuery(MY_ROOMS_QUERY);

  const {
    data: messagesData,
    loading: messagesLoading,
    refetch: refetchMessages,
  } = useQuery(MESSAGES_QUERY, {
    variables: { roomId: selectedRoomId },
    skip: !selectedRoomId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // GraphQL Mutations: Handle message operations
  const [sendMessage, { loading: sendMessageLoading }] = useMutation(
    SEND_MESSAGE_MUTATION
  );

  // GraphQL Subscription: Real-time message updates
  useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    variables: { roomId: selectedRoomId },
    skip: !selectedRoomId,
    onData: () => {
      if (selectedRoomId && refetchMessages) {
        refetchMessages();
        setTimeout(() => {
          // Scroll will be handled by MessageList component
        }, 200);
      }
    },
  });

  // Memoized data to prevent unnecessary re-renders
  const rooms: Room[] = useMemo(() => roomsData?.myRooms || [], [roomsData]);
  const messages: Message[] = useMemo(() => {
    const msgs = messagesData?.messages || [];
    return msgs
      .slice()
      .sort(
        (a: Message, b: Message) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [messagesData]);

  // Select first room by default
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  const handleSendMessage = async (message: string) => {
    if (!selectedRoomId) return;

    try {
      await sendMessage({
        variables: {
          input: {
            roomId: selectedRoomId,
            content: message,
          },
        },
        refetchQueries: [
          {
            query: MESSAGES_QUERY,
            variables: { roomId: selectedRoomId },
          },
        ],
        awaitRefetchQueries: false,
      });
    } catch (error) {
      // Error will be handled by Apollo Client
      console.error("Send message error:", error);
    }
  };

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar
        selectedRoomId={selectedRoomId}
        onRoomSelect={setSelectedRoomId}
        rooms={rooms}
        roomsLoading={roomsLoading}
      />

      <ChatArea
        selectedRoom={selectedRoom}
        messages={messages}
        messagesLoading={messagesLoading}
        onSendMessage={handleSendMessage}
        sendMessageLoading={sendMessageLoading}
        currentUserId={user?.id}
      />
    </div>
  );
};
