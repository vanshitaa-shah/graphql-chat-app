import { GraphQLError } from 'graphql';

export const createAuthError = (message: string) => 
  new GraphQLError(message, { extensions: { code: 'UNAUTHENTICATED' } });

export const createForbiddenError = (message: string) => 
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

export const createNotFoundError = (message: string) => 
  new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } });
