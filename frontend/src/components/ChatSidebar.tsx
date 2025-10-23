import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { MY_ROOMS_QUERY, ROOMS_QUERY, CREATE_ROOM_MUTATION, JOIN_ROOM_MUTATION } from '../graphql/operations';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';
import { BrowseRooms } from './BrowseRooms';
import { CreateRoomForm } from './CreateRoomForm';
import { Search } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description?: string;
}

interface ChatSidebarProps {
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  rooms: Room[];
  roomsLoading: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  selectedRoomId,
  onRoomSelect,
  rooms,
  roomsLoading,
}) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showBrowseRooms, setShowBrowseRooms] = useState(false);

  const { data: allRoomsData, loading: allRoomsLoading } = useQuery(ROOMS_QUERY, {
    skip: !showBrowseRooms,
  });

  const [createRoom, { loading: createRoomLoading }] = useMutation(CREATE_ROOM_MUTATION, {
    refetchQueries: [MY_ROOMS_QUERY],
  });

  const [joinRoom, { loading: joinRoomLoading }] = useMutation(JOIN_ROOM_MUTATION, {
    refetchQueries: [MY_ROOMS_QUERY],
  });

  const allRooms: Room[] = allRoomsData?.rooms || [];
  const userRoomIds = new Set(rooms.map((room) => room.id));
  const availableRooms = allRooms.filter((room) => !userRoomIds.has(room.id));

  const handleCreateRoom = async (name: string, description: string) => {
    try {
      const result = await createRoom({
        variables: {
          input: {
            name: name.trim(),
            description: description.trim() || undefined,
          },
        },
      });

      addToast(SUCCESS_MESSAGES.ROOM_CREATED, 'success');
      setShowCreateRoom(false);

      if (result.data?.createRoom?.room) {
        onRoomSelect(result.data.createRoom.room.id);
      }
    } catch (error) {
      if (error instanceof Error && error.message?.includes('already taken')) {
        addToast(error.message, 'error');
      } else {
        addToast(ERROR_MESSAGES.ROOM_CREATE_FAILED, 'error');
      }
    }
  };

  const handleJoinRoom = async (roomId: string, roomName: string) => {
    try {
      await joinRoom({
        variables: { input: { roomId } },
      });

      addToast(SUCCESS_MESSAGES.ROOM_JOINED_WITH_NAME(roomName), 'success');
      onRoomSelect(roomId);
      setShowBrowseRooms(false);
    } catch {
      addToast(ERROR_MESSAGES.ROOM_JOIN_FAILED, 'error');
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
      {/* Sidebar Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Chat Rooms</h2>
            <p className="text-blue-100 text-sm">
              Welcome back, {user?.username}!
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">My Rooms</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBrowseRooms(!showBrowseRooms)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse
            </button>
            <button
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              className="bg-slate-500 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              New Room
            </button>
          </div>
        </div>

        {/* Browse Rooms Section */}
        {showBrowseRooms && (
          <BrowseRooms
            availableRooms={availableRooms}
            loading={allRoomsLoading}
            onJoinRoom={handleJoinRoom}
            joinRoomLoading={joinRoomLoading}
            onClose={() => setShowBrowseRooms(false)}
          />
        )}

        {/* Create Room Form */}
        {showCreateRoom && (
          <CreateRoomForm
            onCreateRoom={handleCreateRoom}
            onCancel={() => setShowCreateRoom(false)}
            loading={createRoomLoading}
          />
        )}

        {/* Rooms List */}
        <div className="space-y-2">
          {roomsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-500 border-t-transparent"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No rooms yet</p>
              <p className="text-sm">Create your first room to start chatting!</p>
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                  selectedRoomId === room.id
                    ? 'bg-slate-500 text-white shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-sm'
                }`}
              >
                <div className="font-medium text-sm mb-1 truncate">{room.name}</div>
                {room.description && (
                  <div
                    className={`text-xs truncate ${
                      selectedRoomId === room.id ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {room.description}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
