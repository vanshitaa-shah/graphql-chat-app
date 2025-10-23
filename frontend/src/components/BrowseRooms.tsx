import React from 'react';
import { Globe } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description?: string;
}

interface BrowseRoomsProps {
  availableRooms: Room[];
  loading: boolean;
  onJoinRoom: (roomId: string, roomName: string) => void;
  joinRoomLoading: boolean;
  onClose: () => void;
}

export const BrowseRooms: React.FC<BrowseRoomsProps> = ({
  availableRooms,
  loading,
  onJoinRoom,
  joinRoomLoading,
  onClose,
}) => {
  return (
    <div className="bg-green-50 rounded-xl p-4 mb-4 border-2 border-green-200">
      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Available Public Rooms
      </h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
          </div>
        ) : availableRooms.length === 0 ? (
          <p className="text-green-700 text-sm text-center py-4">
            No new rooms available to join
          </p>
        ) : (
          availableRooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
            >
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-800">{room.name}</div>
                {room.description && (
                  <div className="text-xs text-gray-600 mt-1">{room.description}</div>
                )}
              </div>
              <button
                onClick={() => onJoinRoom(room.id, room.name)}
                disabled={joinRoomLoading}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
              >
                {joinRoomLoading ? 'Joining...' : 'Join'}
              </button>
            </div>
          ))
        )}
      </div>
      <button
        onClick={onClose}
        className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium"
      >
        Close Browser
      </button>
    </div>
  );
};
