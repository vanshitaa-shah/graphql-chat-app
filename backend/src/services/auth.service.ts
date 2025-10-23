import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../database';
import { createAuthError } from '../utils/errors';

export interface JWTPayload {
  userId: string;
  email: string;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Compare password
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  // Verify JWT token
  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      
      // Type guard to ensure the decoded token has the expected structure
      if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'email' in decoded) {
        return decoded as JWTPayload;
      }
      
      throw createAuthError('Invalid token structure');
    } catch (error) {
      // If it's already a GraphQL error, re-throw it
      if (error && typeof error === 'object' && 'extensions' in error) {
        throw error;
      }
      throw createAuthError('Invalid or expired token');
    }
  }

  // Extract user ID from token
  getUserIdFromToken(token: string): string {
    const payload = this.verifyToken(token);
    return payload.userId;
  }
}

export const authService = new AuthService();
