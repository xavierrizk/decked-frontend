import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Auto-logout on expired/invalid token
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const msg = err.response?.data?.error || '';
      if (msg.includes('expired') || msg.includes('Invalid')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default API_URL;
