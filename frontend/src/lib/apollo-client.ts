import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { showGlobalToast } from '../context/ToastContext';
import { API_CONFIG, AUTH_CONFIG, ERROR_MESSAGES } from '../constants';

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: API_CONFIG.GRAPHQL_ENDPOINT,
  credentials: 'include',
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(createClient({
  url: API_CONFIG.WS_ENDPOINT,
  connectionParams: () => ({
    authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
  }),
  shouldRetry: () => true,
  retryAttempts: 5,
  retryWait: async (attempt) => {
    console.log(`🔄 WebSocket reconnection attempt ${attempt}`);
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
  },
  on: {
    connected: () => console.log('🟢 WebSocket connected successfully'),
    closed: (event) => console.log('🔴 WebSocket connection closed:', event),
    error: (error) => console.error('❌ WebSocket error:', error),
  },
}));

// Auth link to add token to headers
const authLink = setContext(() => ({
  headers: {
    authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
  },
}));

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      if (message.includes('Not authenticated') || message.includes('Invalid token')) {
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        showGlobalToast(ERROR_MESSAGES.AUTHENTICATION_FAILED, 'error');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showGlobalToast(message || ERROR_MESSAGES.GENERIC_ERROR, 'error');
      }
    });
  }

  if (networkError) {
    showGlobalToast(ERROR_MESSAGES.NETWORK_ERROR, 'error');
  }
});

// Split link to route queries/mutations vs subscriptions
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  from([errorLink, authLink, httpLink])
);

// Apollo Client instance
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Message: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
      fetchPolicy: 'no-cache', // Don't cache mutations to avoid stale optimistic responses
    },
  },
});
