// Xenoverify API Configuration
// Points to /api in production (routed by vercel.json) or custom environment variable

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' && window.location.port === '5173'
    ? 'http://localhost:8000/api'
    : '/api');

