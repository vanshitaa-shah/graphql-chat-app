import { gql } from '@apollo/client';

export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded($roomId: ID!) {
    messageAdded(roomId: $roomId) {
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
`;

export const ROOM_MEMBER_JOINED_SUBSCRIPTION = gql`
  subscription RoomMemberJoined($roomId: ID!) {
    roomMemberJoined(roomId: $roomId) {
      id
      user {
        id
        username
      }
      role
      joinedAt
    }
  }
`;

export const ROOM_MEMBER_LEFT_SUBSCRIPTION = gql`
  subscription RoomMemberLeft($roomId: ID!) {
    roomMemberLeft(roomId: $roomId) {
      id
      user {
        id
        username
      }
      role
      joinedAt
    }
  }
`;
