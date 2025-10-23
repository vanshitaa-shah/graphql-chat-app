// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  GRAPHQL_ENDPOINT: import.meta.env.VITE_GRAPHQL_ENDPOINT,
  WS_ENDPOINT: import.meta.env.VITE_WS_ENDPOINT,
} as const;

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: import.meta.env.VITE_TOKEN_KEY,
  TOKEN_EXPIRY_KEY: import.meta.env.VITE_TOKEN_EXPIRY_KEY,
} as const;

// Toast Configuration
export const TOAST_CONFIG = {
  DEFAULT_DURATION: 5000,
  AUTO_CLOSE_DELAY: 300,
  MAX_TOASTS: 5,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  AUTHENTICATION_FAILED: "Authentication failed. Please log in again.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  USER_ALREADY_EXISTS: "User with this email already exists.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
  VALIDATION_EMAIL: "Please enter a valid email address.",
  VALIDATION_PASSWORD: "Password must be at least 6 characters long.",
  VALIDATION_USERNAME: "Username must be at least 2 characters long.",
  ROOM_CREATE_FAILED: "Failed to create room. Please try again.",
  ROOM_JOIN_FAILED: "Failed to join room. Please try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Successfully logged in!",
  SIGNUP_SUCCESS: "Account created successfully!",
  LOGOUT_SUCCESS: "Successfully logged out!",
  MESSAGE_SENT: "Message sent!",
  ROOM_CREATED: "Room created successfully!",
  ROOM_JOINED: "Joined room successfully!",
  ROOM_JOINED_WITH_NAME: (roomName: string) => `Successfully joined ${roomName}!`,
} as const;


export const ROOM_FORM_PLACEHOLDERS = {
  NAME: "Room name (must be unique)",
  DESCRIPTION: "Room description (optional)",
} as const;

