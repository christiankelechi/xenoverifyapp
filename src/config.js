// Xenoverify API Configuration
// Change this URL if your Django backend is deployed on a separate domain (e.g., Render, Railway, DuckDNS, or VPS)

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' && window.location.port === '5173'
    ? 'https://xenoverify.vercel.app'
    : '/api');
