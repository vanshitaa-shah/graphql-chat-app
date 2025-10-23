import { gql } from '@apollo/client';

// Authentication mutations
export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      token
      user {
        id
        username
        email
        createdAt
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        username
        email
        createdAt
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

// Room mutations
export const CREATE_ROOM_MUTATION = gql`
  mutation CreateRoom($input: CreateRoomInput!) {
    createRoom(input: $input) {
      room {
        id
        name
        description
        isPrivate
        messageCount
        createdAt
        members {
          id
          user {
            id
            username
          }
          role
          joinedAt
        }
      }
    }
  }
`;

export const JOIN_ROOM_MUTATION = gql`
  mutation JoinRoom($input: JoinRoomInput!) {
    joinRoom(input: $input) {
      room {
        id
        name
        description
        isPrivate
        messageCount
        createdAt
        members {
          id
          user {
            id
            username
          }
          role
          joinedAt
        }
      }
    }
  }
`;

export const LEAVE_ROOM_MUTATION = gql`
  mutation LeaveRoom($roomId: ID!) {
    leaveRoom(roomId: $roomId)
  }
`;

// Message mutations
export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      message {
        id
        content
        createdAt
        user {
          id
          username
        }
        room {
          id
          name
        }
      }
    }
  }
`;
