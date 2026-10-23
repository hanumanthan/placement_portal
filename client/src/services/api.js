import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for sending/receiving httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns a structured message, format it nicely
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    // Attach readable message to error object
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;
