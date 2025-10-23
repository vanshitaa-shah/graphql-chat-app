import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

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

interface ChatAreaProps {
  selectedRoom: Room | undefined;
  messages: Message[];
  messagesLoading: boolean;
  onSendMessage: (message: string) => void;
  sendMessageLoading: boolean;
  currentUserId?: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedRoom,
  messages,
  messagesLoading,
  onSendMessage,
  sendMessageLoading,
  currentUserId,
}) => {
  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-6">💬</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Chat!</h2>
          <p className="text-gray-600 mb-4">Select a room to start chatting</p>
          <p className="text-gray-500 text-sm">Choose a room from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-1">{selectedRoom.name}</h2>
        {selectedRoom.description && (
          <p className="text-gray-600 text-sm">{selectedRoom.description}</p>
        )}
      </div>

      {/* Messages Container */}
      <MessageList messages={messages} loading={messagesLoading} currentUserId={currentUserId} />

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} loading={sendMessageLoading} />
    </div>
  );
};
