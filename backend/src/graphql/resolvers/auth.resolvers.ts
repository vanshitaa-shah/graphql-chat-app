import { GraphQLContext } from '../context';
import { authService } from '../../services/auth.service';
import { prisma } from '../../database';
import { createAuthError, createForbiddenError } from '../../utils/errors';
import { SignupInput, LoginInput } from '../types';

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw createAuthError('Not authenticated');
      }
      return context.user;
    },
  },

  Mutation: {
    signup: async (_: any, { input }: { input: SignupInput }) => {
      const { email, username, password } = input;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        throw createForbiddenError('User with this email or username already exists');
      }

      // Hash password and create user
      const hashedPassword = await authService.hashPassword(password);
      
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        },
      });

      // Generate token
      const token = authService.generateToken(user);

      return {
        user,
        token,
      };
    },

    login: async (_: any, { input }: { input: LoginInput }, context: GraphQLContext) => {
      const { email, password } = input;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw createAuthError('Invalid credentials');
      }

      // Compare password
      const isValidPassword = await authService.comparePassword(password, user.password);
      
      if (!isValidPassword) {
        throw createAuthError('Invalid credentials');
      }

      // Generate token
      const token = authService.generateToken(user);

      // Set httpOnly cookie
      context.res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        user,
        token,
      };
    },

    logout: async (_: any, __: any, context: GraphQLContext) => {
      context.res.clearCookie('token');
      return true;
    },
  },
};
