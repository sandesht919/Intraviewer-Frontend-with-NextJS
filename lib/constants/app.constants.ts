/**
 * Application Constants
 */

// Interview Configuration
export const INTERVIEW_CONSTANTS = {
  QUESTION_TIME_LIMIT: 90, // seconds per question
  AUDIO_CHUNK_DURATION: 10000, // 10 seconds
  FRAME_CAPTURE_INTERVAL: 2000, // 2 seconds
  MAX_QUESTIONS: 10,
  MIN_QUESTIONS: 3,
} as const;

// Media Configuration
export const MEDIA_CONSTANTS = {
  VIDEO_CONSTRAINTS: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
  AUDIO_CONSTRAINTS: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
} as const;

// File Upload Configuration
export const FILE_CONSTANTS = {
  MAX_CV_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_CV_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
  ],
  CV_EXTENSION_LABELS: {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'image/jpeg': '.jpg/.jpeg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/bmp': '.bmp',
    'image/webp': '.webp',
  },
} as const;

// Authentication Configuration
export const AUTH_CONSTANTS = {
  TOKEN_REFRESH_INTERVAL: 14 * 60 * 1000, // 14 minutes
  SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour
  COOKIE_NAME: 'auth_token',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60, // 7 days
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  INTERVIEW_PREPARE: '/interview/prepare',
  INTERVIEW_SESSION: '/interview/session',
  INTERVIEW_RESULTS: '/interview/results',
} as const;

// Public Routes (no authentication required)
export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.SIGNUP] as const;

// API Endpoints (for reference)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  INTERVIEWS: {
    START: '/interviews/start',
    GENERATE_QUESTIONS: '/api/interviews/generate-questions',
    SUBMIT_RESPONSE: (id: string | number) => `/interviews/${id}/responses`,
    COMPLETE: (id: string | number) => `/interviews/${id}/complete`,
    RESULTS: (id: string | number) => `/interviews/${id}/results`,
    UPLOAD_CV: '/api/interviews/upload-cv',
  },
} as const;

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  LOADING_DELAY: 500,
  ANIMATION_DURATION: 200,
} as const;

// Status Messages
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Successfully logged in!',
    SIGNUP_SUCCESS: 'Account created successfully!',
    LOGOUT_SUCCESS: 'Logged out successfully',
    LOGIN_REQUIRED: 'Please log in to continue',
    INVALID_CREDENTIALS: 'Invalid email or password',
  },
  INTERVIEW: {
    SESSION_STARTED: 'Interview session started',
    RESPONSE_SAVED: 'Response saved successfully',
    SESSION_COMPLETED: 'Interview completed!',
    GENERATION_FAILED: 'Failed to generate questions',
    CV_UPLOAD_SUCCESS: 'CV uploaded successfully',
  },
  ERRORS: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Session expired. Please log in again.',
  },
} as const;
