import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  ME_QUERY,
  LOGIN_MUTATION, 
  SIGNUP_MUTATION, 
  LOGOUT_MUTATION
} from '../graphql/operations';

// Use a simplified User type for authentication context
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  __typename?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  // Safely check for token
  const [hasToken, setHasToken] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setHasToken(!!token);
    if (!token) {
      setInitializing(false);
    }
  }, []);
  
  // GraphQL Query: Fetch current user data if token exists
  const { data, loading: queryLoading } = useQuery(ME_QUERY, {
    errorPolicy: 'ignore',
    skip: !hasToken, // Skip query if no token
    onCompleted: () => setInitializing(false),
    onError: () => setInitializing(false),
  });

  // GraphQL Mutations: Handle authentication operations using document constants
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [signupMutation, { loading: signupLoading }] = useMutation(SIGNUP_MUTATION);
  const [logoutMutation, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION);

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    } else if (!hasToken) {
      // No token, so user is not authenticated
      setInitializing(false);
    }
  }, [data, hasToken]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await loginMutation({
        variables: { input: { email, password } },
        errorPolicy: 'none', // Ensure errors are thrown
      });

      if (result.data?.login) {
        const { user, token } = result.data.login;
        localStorage.setItem('token', token);
        setHasToken(true);
        setUser(user);
        return true; // Return success indicator
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw to let component handle it
    }
  };

  const signup = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      const result = await signupMutation({
        variables: { input: { email, username, password } },
        errorPolicy: 'none', // Ensure errors are thrown
      });

      if (result.data?.signup) {
        const { user, token } = result.data.signup;
        localStorage.setItem('token', token);
        setHasToken(true);
        setUser(user);
        return true; // Return success indicator
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      throw error; // Re-throw to let component handle it
    }
  };

  const logout = async () => {
    try {
      await logoutMutation();
      localStorage.removeItem('token');
      setHasToken(false);
      setUser(null);
    } catch {
      // Even if the mutation fails, clear local state
      localStorage.removeItem('token');
      setHasToken(false);
      setUser(null);
    }
  };

  const loading = ((initializing || queryLoading) && hasToken) || loginLoading || signupLoading || logoutLoading;

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
