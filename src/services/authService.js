import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.alacademeya.com/api',
});

export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);

export const verifyAccount = (data) => API.post('/auth/verifyAccount', data);