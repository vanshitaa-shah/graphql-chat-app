import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { DataLoaders } from '../services/dataloader.service';

export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: User | null;
  dataloaders: DataLoaders;
}

export interface SubscriptionContext {
  connectionParams?: any;
  user?: User | null;
}
