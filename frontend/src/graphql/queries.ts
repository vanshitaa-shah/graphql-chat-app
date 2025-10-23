import { gql } from '@apollo/client';

// User queries
export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      createdAt
    }
  }
`;

// Room queries
export const ROOMS_QUERY = gql`
  query Rooms {
    rooms {
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
`;

export const MY_ROOMS_QUERY = gql`
  query MyRooms {
    myRooms {
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
`;

export const ROOM_QUERY = gql`
  query Room($id: ID!) {
    room(id: $id) {
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
`;

// Message queries
export const MESSAGES_QUERY = gql`
  query Messages($roomId: ID!, $limit: Int, $offset: Int) {
    messages(roomId: $roomId, limit: $limit, offset: $offset) {
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
