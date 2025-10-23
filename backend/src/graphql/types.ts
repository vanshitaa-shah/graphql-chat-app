import { User, Room, Message } from '@prisma/client';

// Input types
export interface SignupInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateRoomInput {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface JoinRoomInput {
  roomId: string;
}

export interface SendMessageInput {
  roomId: string;
  content: string;
}

// Response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface MessageResponse {
  message: Message;
}

export interface RoomResponse {
  room: Room;
}
