import { withFilter } from 'graphql-subscriptions';
import { GraphQLContext } from '../context';
import { prisma } from '../../database';
import { SendMessageInput } from '../types';
import { pubSub } from '../pubsub';
import { createAuthError, createForbiddenError } from '../../utils/errors';

const MESSAGE_ADDED = 'MESSAGE_ADDED';

export const messageResolvers = {
  Query: {
    messages: async (_: any, { roomId, limit = 50, offset = 0 }: { roomId: string; limit: number; offset: number }, context: GraphQLContext) => {
      if (!context.user) {
        throw createAuthError('Not authenticated');
      }

      // Check if user has access to this room
      const membership = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: {
            userId: context.user.id,
            roomId,
          },
        },
      });

      if (!membership) {
        throw createForbiddenError('Access denied to this room');
      }

      return prisma.message.findMany({
        where: { roomId },
        orderBy: { createdAt: 'asc' }, // Oldest first for proper chat order
        take: limit,
        skip: offset,
        include: {
          user: true,
        },
      });
    },
  },

  Mutation: {
    sendMessage: async (_: any, { input }: { input: SendMessageInput }, context: GraphQLContext) => {
      if (!context.user) {
        throw createAuthError('Not authenticated');
      }

      const { roomId, content } = input;

      // Check if user has access to this room
      const membership = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: {
            userId: context.user.id,
            roomId,
          },
        },
      });

      if (!membership) {
        throw createForbiddenError('Access denied to this room');
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          content,
          userId: context.user.id,
          roomId,
        },
        include: {
          user: true,
          room: true,
        },
      });

      // Clear cache
      context.dataloaders.messagesByRoomLoader.clear(roomId);

      // Publish to subscription
      pubSub.publish(MESSAGE_ADDED, {
        messageAdded: message,
        roomId,
      });

      return { message };
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        () => {
          return pubSub.asyncIterator([MESSAGE_ADDED]);
        },
        (payload: any, variables: any, context: any) => {
          return payload.roomId === variables.roomId;
        }
      ),
    },
  },

  // Field resolvers
  Message: {
    user: async (message: any, _: any, context: GraphQLContext) => {
      return context.dataloaders.userLoader.load(message.userId);
    },

    room: async (message: any, _: any, context: GraphQLContext) => {
      return context.dataloaders.roomLoader.load(message.roomId);
    },
  },
};
