import { DateTimeResolver } from 'graphql-scalars';
import { authResolvers } from './auth.resolvers';
import { userResolvers } from './user.resolvers';
import { roomResolvers } from './room.resolvers';
import { messageResolvers } from './message.resolvers';

export const resolvers = {
  DateTime: DateTimeResolver,

  Query: {
    ...authResolvers.Query,
    ...roomResolvers.Query,
    ...messageResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...roomResolvers.Mutation,
    ...messageResolvers.Mutation,
  },

  Subscription: {
    ...messageResolvers.Subscription,
  },

  // Type resolvers
  User: userResolvers.User,
  Room: roomResolvers.Room,
  RoomMember: roomResolvers.RoomMember,
  Message: messageResolvers.Message,
};
