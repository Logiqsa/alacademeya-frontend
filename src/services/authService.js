import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.alacademeya.com/api',
});

// The countries endpoint lives outside the /api prefix
// (confirmed via Postman: https://api.alacademeya.com/countries),
// and it also requires the same Bearer token as the rest of the app.
const ROOT_API = axios.create({
  baseURL: 'https://api.alacademeya.com',
});

// Attach the auth token to outgoing requests on both instances.
// Adjust the storage key/shape below to match however the token
// is actually stored after login in this app.
const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
API.interceptors.request.use(attachToken);
ROOT_API.interceptors.request.use(attachToken);

export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);
export const verifyAccount = (data) => API.post('/auth/verifyAccount', data);

export const resendOtp = (email) => API.post('/auth/resend-otp', { email });
export const saveStudentInterests = (payload) => API.post('/auth/student/interests', payload);
export const saveTeacherDetails = (payload) => API.post('/auth/teacher/details', payload);
export const getAccountState = () => API.get('/auth/account-state');
export const getCountries = () => API.get('/countries');