// Backend URL configuration
// Dynamically choose the backend URL based on the current environment

// Determine if we're running in production or development
const isProduction = import.meta.env.PROD || 
                    window.location.hostname === 'izypt.com' || 
                    window.location.hostname === 'www.izypt.com' ||
                    window.location.hostname.includes('vercel.app');

// Choose the appropriate backend URL
export const BACKEND_URL = isProduction 
  ? "https://app.izypt.com"  // Production backend on Render
  : "http://localhost:5001"; // Local development

console.log('Using backend URL:', BACKEND_URL);