import { GraphQLContext } from '../context';

export const userResolvers = {
  // Field resolvers
  User: {
    rooms: async (user: any, _: any, context: GraphQLContext) => {
      return context.dataloaders.userRoomsLoader.load(user.id);
    },
  },
};
