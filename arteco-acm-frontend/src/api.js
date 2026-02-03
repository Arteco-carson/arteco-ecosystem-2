import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL || '';

// Remove any trailing slash to prevent double slashes in requests
if (apiUrl.endsWith('/')) {
  apiUrl = apiUrl.slice(0, -1);
}

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
