import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add user ID to every request from localStorage
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('labs_user_id');
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

export default api;
