// Xenoverify API Configuration
// Backend is hosted separately at https://xenoverify.vercel.app

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (isLocal ? 'http://localhost:8000/api' : 'https://xenoverify.vercel.app/api');


