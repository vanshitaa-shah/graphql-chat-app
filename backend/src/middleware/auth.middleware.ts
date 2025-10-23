import { Request, Response } from 'express';
import { GraphQLContext } from '../graphql/context';
import { authService } from '../services/auth.service';
import { prisma } from '../database';
import { createDataLoaders } from '../services/dataloader.service';

export const createContext = async ({ req, res }: any): Promise<GraphQLContext> => {
  let user: any = null;

  // Try to get token from cookies or Authorization header
  const token = req.cookies?.token ?? req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const payload = authService.verifyToken(token);
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
    } catch (error) {
      // Invalid token, continue without user
    }
  }

  return {
    req,
    res,
    user,
    dataloaders: createDataLoaders(),
  };
};

// For WebSocket subscriptions
export const createSubscriptionContext = async ({ connectionParams }: any) => {
  let user: any = null;

  const token = connectionParams?.authorization?.replace('Bearer ', '') ?? 
                connectionParams?.token ??
                connectionParams?.Authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const payload = authService.verifyToken(token);
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
    } catch (error) {
      // Invalid subscription token
    }
  }

  return {
    user,
    dataloaders: createDataLoaders(),
  };
};
