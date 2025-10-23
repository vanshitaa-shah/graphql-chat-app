import React, { useState } from 'react';
import { ROOM_FORM_PLACEHOLDERS } from '../constants';

interface CreateRoomFormProps {
  onCreateRoom: (name: string, description: string) => void;
  onCancel: () => void;
  loading: boolean;
}

export const CreateRoomForm: React.FC<CreateRoomFormProps> = ({
  onCreateRoom,
  onCancel,
  loading,
}) => {
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    onCreateRoom(roomName, roomDescription);
    setRoomName('');
    setRoomDescription('');
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-4 border-2 border-dashed border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder={ROOM_FORM_PLACEHOLDERS.NAME}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Choose a unique name that others can easily find
          </p>
        </div>
        <textarea
          value={roomDescription}
          onChange={(e) => setRoomDescription(e.target.value)}
          placeholder={ROOM_FORM_PLACEHOLDERS.DESCRIPTION}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none text-sm resize-none"
          rows={2}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !roomName.trim()}
            className="bg-slate-500 hover:bg-slate-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex-1"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
