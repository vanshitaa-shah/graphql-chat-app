import DataLoader from 'dataloader';
import { User, Room, Message, RoomMember } from '@prisma/client';
import { prisma } from '../database';

export class DataLoaders {
  // User loaders
  userLoader = new DataLoader<string, User | null>(async (userIds) => {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
    });
    
    return userIds.map(id => users.find(user => user.id === id) || null);
  });

  // Room loaders
  roomLoader = new DataLoader<string, Room | null>(async (roomIds) => {
    const rooms = await prisma.room.findMany({
      where: { id: { in: roomIds as string[] } },
    });
    
    return roomIds.map(id => rooms.find(room => room.id === id) || null);
  });

  // Messages by room loader
  messagesByRoomLoader = new DataLoader<string, Message[]>(async (roomIds) => {
    const messages = await prisma.message.findMany({
      where: { roomId: { in: roomIds as string[] } },
      orderBy: { createdAt: 'asc' },
      include: {
        user: true,
      },
    });
    
    return roomIds.map(roomId => 
      messages.filter(message => message.roomId === roomId)
    );
  });

  // Room members by room loader
  roomMembersByRoomLoader = new DataLoader<string, RoomMember[]>(async (roomIds) => {
    const roomMembers = await prisma.roomMember.findMany({
      where: { roomId: { in: roomIds as string[] } },
      include: {
        user: true,
      },
    });
    
    return roomIds.map(roomId => 
      roomMembers.filter(member => member.roomId === roomId)
    );
  });

  // User rooms loader
  userRoomsLoader = new DataLoader<string, Room[]>(async (userIds) => {
    const roomMembers = await prisma.roomMember.findMany({
      where: { userId: { in: userIds as string[] } },
      include: {
        room: true,
      },
    });
    
    return userIds.map(userId => 
      roomMembers
        .filter(member => member.userId === userId)
        .map(member => member.room)
    );
  });

  // Clear all caches (useful for testing)
  clearAll() {
    this.userLoader.clearAll();
    this.roomLoader.clearAll();
    this.messagesByRoomLoader.clearAll();
    this.roomMembersByRoomLoader.clearAll();
    this.userRoomsLoader.clearAll();
  }
}

export const createDataLoaders = () => new DataLoaders();
