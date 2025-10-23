# Full-Stack Chat Application with GraphQL

A modern real-time chat application built with GraphQL, Apollo Server, React, and TypeScript. Features federation-ready architecture, optimistic UI updates, real-time subscriptions, and comprehensive authentication.

## 🔥 **How the Room-Based Chat Flow Works**

### **For Users Accessing the Same Room:**

1. **User Registration & Login**: Each user creates an account and logs in
2. **Room Discovery & Access**: 
   - **Browse Public Rooms**: Click the "Browse" button to see all available rooms
   - **Join Existing Rooms**: Click "Join" on any room you want to participate in
   - **Create New Rooms**: Use "New Room" to create rooms with unique names that others can join
3. **Unique Room Names**: Room names must be unique across the platform to prevent confusion and ensure easy discovery
4. **Real-time Communication**:
   - **Instant Messaging**: Messages appear immediately for all room members via GraphQL subscriptions
   - **Live Updates**: New users joining or messages being sent update in real-time
   - **Persistent History**: Message history is preserved and shown when users join

### **Room Management Features:**
- **Unique Naming**: Each room must have a unique name to prevent confusion
- **Room Discovery**: Browse all public rooms and join any you're interested in
- **Real-time Updates**: See new messages and room activity instantly
- **Owner Privileges**: Room creators become owners with special permissions

### **Technical Implementation:**
- **GraphQL Subscriptions**: WebSocket connections ensure real-time message delivery
- **Apollo Client Caching**: Efficient data management and UI updates
- **Room-based Filtering**: Messages are filtered by room ID on both client and server
- **Optimistic Updates**: Messages appear instantly while being sent to server

## 🏗️ Architecture

### Backend (GraphQL + Apollo Server + Federation-ready)
- **Tech Stack**: Node.js + TypeScript + Apollo Server + Prisma + SQLite
- **Authentication**: JWT with httpOnly cookies
- **Real-time**: GraphQL subscriptions for live chat updates
- **Database**: Prisma ORM with SQLite (easily switchable to PostgreSQL)
- **Performance**: DataLoader for batching and caching DB requests
- **Modular Structure**: Organized by feature modules (auth, users, rooms, messages)
- **Federation Ready**: Prepared for future microservices split

### Frontend (React 19 + Apollo Client + GraphQL Codegen)
- **Tech Stack**: React 19 + Vite + Apollo Client + TypeScript
- **GraphQL Integration**: Apollo Client with normalized caching
- **Code Generation**: GraphQL Codegen for type-safe operations
- **Real-time UI**: Subscriptions with optimistic updates
- **Advanced Features**: Cache policies, fragments, error handling
- **Modern UI**: Responsive design with CSS Grid/Flexbox

## 🚀 Features

### Backend Features
- ✅ **GraphQL API** with queries, mutations, and subscriptions
- ✅ **JWT Authentication** with secure httpOnly cookies
- ✅ **Real-time Chat** via GraphQL subscriptions
- ✅ **Room Management** (create, join, leave rooms)
- ✅ **User Management** (signup, login, profile)
- ✅ **DataLoader Integration** to prevent N+1 queries
- ✅ **Federation-ready Schema** for future microservices
- ✅ **TypeScript Safety** throughout the codebase
- ✅ **Database Relations** with Prisma ORM
- ✅ **Error Handling** with proper GraphQL errors

### Frontend Features
- ✅ **Type-safe GraphQL Operations** with codegen
- ✅ **Real-time Message Updates** via subscriptions
- ✅ **Optimistic UI** for instant message sending
- ✅ **Smart Caching** with Apollo Client policies
- ✅ **Fragment Reuse** across queries/mutations
- ✅ **Authentication Flow** with protected routes
- ✅ **Responsive Design** for mobile/desktop
- ✅ **Error Boundaries** and proper error handling
- ✅ **Loading States** throughout the app

## 📁 Project Structure

```
chat-app/
├── backend/                 # GraphQL API Server
│   ├── src/
│   │   ├── database/        # Database connection & models
│   │   ├── graphql/
│   │   │   ├── resolvers/   # Query, Mutation, Subscription resolvers
│   │   │   ├── schema.ts    # GraphQL type definitions
│   │   │   └── context.ts   # GraphQL context setup
│   │   ├── services/        # Business logic services
│   │   │   ├── auth.service.ts      # JWT auth logic
│   │   │   └── dataloader.service.ts # DataLoader setup
│   │   ├── middleware/      # Express middleware
│   │   └── index.ts         # Server entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── package.json
│   └── .env                 # Environment variables
│
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ChatApp.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── RoomList.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── graphql/
│   │   │   └── operations.ts    # All GraphQL queries/mutations
│   │   ├── lib/
│   │   │   └── apollo-client.ts # Apollo Client config
│   │   └── App.tsx
│   ├── codegen.yml          # GraphQL Codegen config
│   └── package.json
│
├── start-backend.sh         # Backend startup script
├── start-frontend.sh        # Frontend startup script
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone & Navigate
```bash
cd "/home/vanshita/Desktop/goals and demos/graphql/chat-app"
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment variables (edit as needed)
cp .env.example .env  # Update JWT_SECRET and other vars

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```
Backend will run on: `http://localhost:4000/graphql`

### 3. Frontend Setup (in a new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Generate GraphQL types (after backend is running)
npm run codegen

# Start development server
npm run dev
```
Frontend will run on: `http://localhost:5173`

### 4. Quick Start (Alternative)
```bash
# Terminal 1: Start backend
./start-backend.sh

# Terminal 2: Start frontend  
./start-frontend.sh
```

## 📚 GraphQL Schema

### Core Types
```graphql
type User {
  id: ID!
  email: String!
  username: String!
  createdAt: DateTime!
  rooms: [Room!]!
}

type Room {
  id: ID!
  name: String!
  description: String
  isPrivate: Boolean!
  members: [RoomMember!]!
  messages: [Message!]!
  messageCount: Int!
}

type Message {
  id: ID!
  content: String!
  user: User!
  room: Room!
  createdAt: DateTime!
}
```

### Key Operations
```graphql
# Authentication
mutation Login($input: LoginInput!) {
  login(input: $input) {
    user { ...UserFields }
    token
  }
}

# Real-time messaging
subscription MessageAdded($roomId: ID!) {
  messageAdded(roomId: $roomId) {
    ...MessageFields
  }
}

# Room management
mutation CreateRoom($input: CreateRoomInput!) {
  createRoom(input: $input) {
    room { ...RoomFields }
  }
}
```

## 🎯 Key Features Explained

### 1. Federation-Ready Architecture
The backend is structured to easily split into microservices:
- **Auth Service**: User authentication and authorization
- **Chat Service**: Rooms and messages
- **User Service**: User profiles and relationships

### 2. DataLoader Implementation
Prevents N+1 queries by batching and caching:
```typescript
// Efficiently loads users for multiple messages
messagesByRoomLoader = new DataLoader<string, Message[]>(async (roomIds) => {
  const messages = await prisma.message.findMany({
    where: { roomId: { in: roomIds as string[] } },
    include: { user: true }
  });
  // Smart batching and caching logic
});
```

### 3. Optimistic UI Updates
Frontend shows immediate feedback before server confirmation:
```typescript
const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION, {
  optimisticResponse: {
    sendMessage: {
      message: {
        __typename: 'Message',
        id: `temp-${Date.now()}`,
        content: newMessage,
        // ... optimistic data
      }
    }
  }
});
```

### 4. Smart Caching Policies
Apollo Client cache configuration for optimal performance:
```typescript
cache: new InMemoryCache({
  typePolicies: {
    Room: {
      fields: {
        messages: {
          merge(existing = [], incoming) {
            return [...existing, ...incoming]; // Append new messages
          }
        }
      }
    }
  }
})
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth with refresh logic
- **httpOnly Cookies**: Prevents XSS attacks on tokens
- **Input Validation**: All GraphQL inputs are validated
- **Authorization**: Room-based access control
- **CORS Configuration**: Proper cross-origin setup
- **Error Sanitization**: No sensitive data leaks in error messages

## 🚀 Performance Optimizations

- **DataLoader**: Batches and caches database queries
- **GraphQL Fragments**: Reusable field selections
- **Apollo Cache**: Normalized caching with smart merge functions
- **Code Splitting**: Lazy loading of route components
- **Subscription Filtering**: Efficient real-time updates
- **Database Indexing**: Optimized Prisma schema

## 🧪 Testing Strategy

### Backend Testing
```bash
cd backend
npm run test        # Unit tests for resolvers and services
npm run test:e2e    # End-to-end API tests
```

### Frontend Testing
```bash
cd frontend
npm run test        # Component and integration tests
npm run test:e2e    # Cypress E2E tests
```

## 📦 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/chatapp"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="production"
```

#### Frontend
```bash
VITE_GRAPHQL_URL="https://api.yourapp.com/graphql"
VITE_WS_URL="wss://api.yourapp.com/graphql"
```

## 🔧 Available Scripts

### Backend
```bash
npm run dev         # Start development server with hot reload
npm run build       # Build TypeScript to JavaScript
npm run start       # Start production server
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:reset    # Reset database (dev only)
npm run db:studio   # Open Prisma Studio
```

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run codegen     # Generate GraphQL types
npm run lint        # Run ESLint
npm run test        # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request



