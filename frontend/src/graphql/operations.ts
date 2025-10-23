// Export all generated types, hooks, and documents
export * from '../generated/graphql';

// Re-export only the document nodes that are actually being used
export {
  SignupDocument as SIGNUP_MUTATION,
  LoginDocument as LOGIN_MUTATION,
  LogoutDocument as LOGOUT_MUTATION,
  MeDocument as ME_QUERY,
  RoomsDocument as ROOMS_QUERY,
  MyRoomsDocument as MY_ROOMS_QUERY,
  CreateRoomDocument as CREATE_ROOM_MUTATION,
  JoinRoomDocument as JOIN_ROOM_MUTATION,
  MessagesDocument as MESSAGES_QUERY,
  SendMessageDocument as SEND_MESSAGE_MUTATION,
  MessageAddedDocument as MESSAGE_ADDED_SUBSCRIPTION,
} from '../generated/graphql';
