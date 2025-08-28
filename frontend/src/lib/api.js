import axios from 'axios';

// Use VITE_API_BASE_URL if provided, else default to localhost:3000
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  withCredentials: false
});

export default api;
