import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import {
  MY_ROOMS_QUERY,
  MESSAGES_QUERY,
  SEND_MESSAGE_MUTATION,
  MESSAGE_ADDED_SUBSCRIPTION,
  type MessagesQuery,
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
    onData: ({ data, client }) => {
      if (data?.data?.messageAdded && selectedRoomId) {
        // Update cache with the new message from subscription
        const existingMessages = client.readQuery<MessagesQuery>({
          query: MESSAGES_QUERY,
          variables: { roomId: selectedRoomId },
        });

        if (existingMessages?.messages) {
          const messageExists = existingMessages.messages.some(
            (msg) => msg.id === data.data.messageAdded.id
          );

          // Only add if not already in cache (prevents duplicates)
          if (!messageExists) {
            client.writeQuery({
              query: MESSAGES_QUERY,
              variables: { roomId: selectedRoomId },
              data: {
                messages: [...existingMessages.messages, data.data.messageAdded],
              },
            });
          }
        }

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
    if (!selectedRoomId || !user) return;

    try {
      await sendMessage({
        variables: {
          input: {
            roomId: selectedRoomId,
            content: message,
          },
        },
        optimisticResponse: {
          sendMessage: {
            __typename: 'MessageResponse',
            message: {
              __typename: 'Message',
              id: `temp-${Date.now()}`,
              content: message,
              createdAt: new Date().toISOString(),
              user: {
                __typename: 'User',
                id: user.id,
                username: user.username,
              },
              room: {
                __typename: 'Room',
                id: selectedRoomId,
                name: selectedRoom?.name || '',
              },
            },
          },
        },
        update: (cache, { data }) => {
          if (!data?.sendMessage?.message) return;

          const newMessage = data.sendMessage.message;

          // Read the current messages from cache
          const existingMessages = cache.readQuery<MessagesQuery>({
            query: MESSAGES_QUERY,
            variables: { roomId: selectedRoomId },
          });

          if (existingMessages?.messages) {
            // Only add the message if it's not already in the cache (avoid duplicates from subscription)
            const messageExists = existingMessages.messages.some(
              (msg) => msg.id === newMessage.id
            );

            if (!messageExists) {
              cache.writeQuery({
                query: MESSAGES_QUERY,
                variables: { roomId: selectedRoomId },
                data: {
                  messages: [...existingMessages.messages, newMessage],
                },
              });
            } else {
              // Message already exists, skip
            }
          }
        },
      });
    } catch {
      // Error will be handled by Apollo Client
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
