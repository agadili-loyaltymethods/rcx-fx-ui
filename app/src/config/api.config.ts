export const API_CONFIG = {
  REST_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/`,
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};