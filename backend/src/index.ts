import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext, createSubscriptionContext } from './middleware/auth.middleware';
import { connectDb, disconnectDb } from './database';

async function startServer() {
  // Create Express app
  const app = express();
  const httpServer = http.createServer(app);

  // Create executable schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: createSubscriptionContext,
      onConnect: async (ctx) => {
        // WebSocket client connected
      },
      onDisconnect: (ctx, code, reason) => {
        // WebSocket client disconnected
      },
    },
    wsServer
  );

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  // Connect to database (non-blocking)
  const dbConnected = await connectDb();
  if (!dbConnected) {
    // Server starting without database connection
  }

  // Start the server
  await server.start();
  
  // Configure CORS origins
  const corsOrigins = [
    "http://localhost:5173",
    "https://chat-graphql-app.netlify.app"
  ];

  app.use(
    '/graphql',
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`🚫 Blocked request from origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
    cookieParser(),
    express.json(),
    expressMiddleware(server, {
      context: createContext,
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const PORT = process.env.PORT || 4000;

  // Start HTTP server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await disconnectDb();
    httpServer.close(() => {
      // HTTP server closed
    });
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  process.exit(1);
});
