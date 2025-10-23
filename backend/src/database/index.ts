import { PrismaClient, User as PrismaUser } from "@prisma/client";

// Prisma client with connection retry and error handling
export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Database connection with retry logic
export const connectDb = async (retries = 1) => {
  try {
    // Set a shorter timeout for connection
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 5000)
      ),
    ]);

    return true;
  } catch {
    return false;
  }
};

// Graceful shutdown
export const disconnectDb = async () => {
  await prisma.$disconnect();
};

// Custom types
export type User = PrismaUser;

export default prisma;
