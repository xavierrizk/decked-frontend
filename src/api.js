import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// On expired/invalid token: clear storage and redirect to login,
// but only if the user actually had a token (i.e. was logged in).
// Don't interrupt in-flight requests mid-submission.
let redirecting = false;
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && !redirecting) {
      const msg = err.response?.data?.error || '';
      const hadToken = !!localStorage.getItem('token');
      if (hadToken && (msg.includes('expired') || msg.includes('Invalid'))) {
        redirecting = true;
        localStorage.removeItem('token');
        // Small delay so any in-flight toast can show first
        setTimeout(() => { window.location.href = '/login?reason=session_expired'; }, 800);
      }
    }
    return Promise.reject(err);
  }
);

export default API_URL;
