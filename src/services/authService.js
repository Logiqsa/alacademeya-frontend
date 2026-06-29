import axios from 'axios';

// In dev mode, this goes through the Vite proxy (see vite.config.js)
// which forwards /api/* to the real backend server-to-server, avoiding
// the CORS preflight block. In production, point this back to the full
// domain ('https://api.alacademeya.com/api') unless your prod server
// also proxies /api.
const API = axios.create({
  baseURL: '/api',
});

const ROOT_API = axios.create({
  baseURL: '/api',
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

// ===== Student profile completion =====
// Matches the "Complete Student Profile" request in Postman:
// POST /api/auth/completeStudentProfile (Bearer Token auth — handled
// automatically by the attachToken interceptor above).
export const completeStudentProfile = (payload) => API.post('/auth/completeStudentProfile', payload);

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

export const removeStudent = (studentId) => API.delete(`/parents/students/${studentId}`);

export const addStudent = (payload) => API.post('/parents/students', payload);
export const getMyStudents = () => API.get('/parents/students');
export const getStudentsStatistics = () => API.get('/parents/students/statistics');

// ===== Parent / Account profile =====
export const getMyProfile = () => API.get('/users/me');
export const updateMyProfile = (payload) => API.patch('/users/me', payload);

// ===== Student record (single child) =====
// NOTE: no dedicated "update student" endpoint exists yet in the backend docs
// provided. Following the same REST pattern as removeStudent/addStudent
// (/parents/students/:id), this PATCH call is wired up ready to go —
// if the real backend route differs, only this one line needs to change.
export const updateStudent = (studentId, payload) =>
  API.patch(`/parents/students/${studentId}`, payload);

// ===== Subscriptions =====
export const createSubscription = (payload) => API.post('/subscriptions', payload);
export const getAllSubscriptions = (params) => API.get('/subscriptions/', { params });
export const getSubscription = (id) => API.get(`/subscriptions/${id}`);
export const getStudentSubscriptionOptions = (studentId) =>
  API.get(`/subscriptions/students/${studentId}/subscription-options`);
export const getPendingSubscriptionRequests = () => API.get('/subscriptions/students/pending');

export const getMyStudentsSubscriptions = () => API.get('/parents/students/subscriptions');

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.patch('/notifications/read-all');