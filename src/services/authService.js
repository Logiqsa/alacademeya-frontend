import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.alacademeya.com/api',
});

const ROOT_API = axios.create({
  baseURL: 'https://api.alacademeya.com/api',
});

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
export const resendOtp = (email, role, country) => API.post('/auth/resend-otp', { email, role, country });
export const verifyAccount = (data) => API.post('/auth/verifyAccount', data);

export const saveStudentInterests = (payload) => API.post('/auth/student/interests', payload);
export const saveTeacherDetails = (payload) => API.post('/auth/teacher/details', payload);
export const getAccountState = () => API.get('/auth/account-state');
export const getCountries = () => API.get('/countries');


export const getCurriculums = () => API.get('/curriculums');
export const getCurriculumStages = (curriculumId) =>
  API.get(`/stages/curriculum/${curriculumId}`);

export const getStageGrades = (stageId) =>
  API.get('/grades', { params: { stage: stageId } });

export const getSubjects = (params) =>
  API.get('/subjects', { params });

export const getAllSubjects = (params) =>
  API.get('/subjects', { params });

export const addStudent = (payload) => API.post('/parents/students', payload);