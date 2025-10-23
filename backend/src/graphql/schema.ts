export const typeDefs = `#graphql
  scalar DateTime

  # Core types
  type User {
    id: ID!
    email: String!
    username: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    rooms: [Room!]!
  }

  type Room {
    id: ID!
    name: String!
    description: String
    isPrivate: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    members: [RoomMember!]!
    messages: [Message!]!
    messageCount: Int!
  }

  type RoomMember {
    id: ID!
    user: User!
    room: Room!
    role: String!
    joinedAt: DateTime!
  }

  type Message {
    id: ID!
    content: String!
    user: User!
    room: Room!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Input types
  input SignupInput {
    email: String!
    username: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateRoomInput {
    name: String!
    description: String
    isPrivate: Boolean = false
  }

  input JoinRoomInput {
    roomId: ID!
  }

  input SendMessageInput {
    roomId: ID!
    content: String!
  }

  # Response types
  type AuthResponse {
    user: User!
    token: String!
  }

  type MessageResponse {
    message: Message!
  }

  type RoomResponse {
    room: Room!
  }

  # Queries
  type Query {
    # Auth
    me: User

    # Rooms
    rooms: [Room!]!
    room(id: ID!): Room
    myRooms: [Room!]!

    # Messages
    messages(roomId: ID!, limit: Int = 50, offset: Int = 0): [Message!]!
  }

  # Mutations
  type Mutation {
    # Auth
    signup(input: SignupInput!): AuthResponse!
    login(input: LoginInput!): AuthResponse!
    logout: Boolean!

    # Rooms
    createRoom(input: CreateRoomInput!): RoomResponse!
    joinRoom(input: JoinRoomInput!): RoomResponse!
    leaveRoom(roomId: ID!): Boolean!

    # Messages
    sendMessage(input: SendMessageInput!): MessageResponse!
  }

  # Subscriptions
  type Subscription {
    messageAdded(roomId: ID!): Message!
    roomMemberJoined(roomId: ID!): RoomMember!
    roomMemberLeft(roomId: ID!): RoomMember!
  }
`;
