import { GraphQLContext } from '../context';
import { prisma } from '../../database';
import { createAuthError, createForbiddenError } from '../../utils/errors';
import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { CreateRoomInput, JoinRoomInput } from '../types';

export const roomResolvers = {
  Query: {
    rooms: async () => {
      return prisma.room.findMany({
        where: {
          isPrivate: false,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    },

    room: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const room = await context.dataloaders.roomLoader.load(id);
      
      if (!room) {
        throw new Error('Room not found');
      }

      // Check if user has access to this room
      if (room.isPrivate && context.user) {
        const membership = await prisma.roomMember.findUnique({
          where: {
            userId_roomId: {
              userId: context.user.id,
              roomId: id,
            },
          },
        });

        if (!membership) {
          throw createForbiddenError('Access denied to this room');
        }
      }

      return room;
    },

    myRooms: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw createAuthError('Not authenticated');
      }

      return context.dataloaders.userRoomsLoader.load(context.user.id);
    },
  },

  Mutation: {
    createRoom: async (_: any, { input }: { input: CreateRoomInput }, context: GraphQLContext) => {
      if (!context.user) {
        throw createAuthError('Not authenticated');
      }

      const { name, description, isPrivate = false } = input;

      try {
        const room = await prisma.room.create({
          data: {
            name,
            description,
            isPrivate,
            members: {
              create: {
                userId: context.user.id,
                role: 'owner',
              },
            },
          },
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        });

        return { room };
      } catch (error) {
        // Handle unique constraint violation for room name
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new GraphQLError(`Room name "${name}" is already taken. Please choose a different name.`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        throw error;
      }
    },

    joinRoom: async (_: any, { input }: { input: JoinRoomInput }, context: GraphQLContext) => {
      if (!context.user) {
        throw createAuthError('Not authenticated');
      }

      const { roomId } = input;

      // Check if room exists
      const room = await context.dataloaders.roomLoader.load(roomId);
      if (!room) {
        throw new GraphQLError('Room not found', { extensions: { code: 'NOT_FOUND' } });
      }

      // Check if user is already a member
      const existingMember = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: {
            userId: context.user.id,
            roomId,
          },
        },
      });

      if (existingMember) {
        throw createForbiddenError('Already a member of this room');
      }

      // Add user to room
      await prisma.roomMember.create({
        data: {
          userId: context.user.id,
          roomId,
          role: 'member',
        },
      });

      // Clear cache and reload room
      context.dataloaders.roomMembersByRoomLoader.clear(roomId);
      context.dataloaders.userRoomsLoader.clear(context.user.id);

      const updatedRoom = await context.dataloaders.roomLoader.load(roomId);
      
      return { room: updatedRoom };
    },

    leaveRoom: async (_: any, { roomId }: { roomId: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw createAuthError('Not authenticated');
      }

      // Check if user is a member
      const membership = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: {
            userId: context.user.id,
            roomId,
          },
        },
      });

      if (!membership) {
        throw createForbiddenError('Not a member of this room');
      }

      // Don't allow owner to leave (transfer ownership first)
      if (membership.role === 'owner') {
        throw createForbiddenError('Room owner cannot leave. Transfer ownership first.');
      }

      // Remove membership
      await prisma.roomMember.delete({
        where: {
          userId_roomId: {
            userId: context.user.id,
            roomId,
          },
        },
      });

      // Clear cache
      context.dataloaders.roomMembersByRoomLoader.clear(roomId);
      context.dataloaders.userRoomsLoader.clear(context.user.id);

      return true;
    },
  },

  // Field resolvers
  Room: {
    members: async (room: any, _: any, context: GraphQLContext) => {
      return context.dataloaders.roomMembersByRoomLoader.load(room.id);
    },

    messages: async (room: any, _: any, context: GraphQLContext) => {
      return context.dataloaders.messagesByRoomLoader.load(room.id);
    },

    messageCount: async (room: any, _: any, context: GraphQLContext) => {
      const messages = await context.dataloaders.messagesByRoomLoader.load(room.id);
      return messages.length;
    },
  },

  RoomMember: {
    user: async (roomMember: any, _: any, context: GraphQLContext) => {
      return context.dataloaders.userLoader.load(roomMember.userId);
    },

    room: async (roomMember: any, _: any, context: GraphQLContext) => {
      return context.dataloaders.roomLoader.load(roomMember.roomId);
    },
  },
};
