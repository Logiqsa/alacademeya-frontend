import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

const ROOT_API = axios.create({
  baseURL: '/api',
});

// const API = axios.create({
//   baseURL: 'https://api.alacademeya.com/api',
// });

// const ROOT_API = axios.create({
//   baseURL: 'https://api.alacademeya.com/api',
// });

const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

API.interceptors.request.use(attachToken);
ROOT_API.interceptors.request.use(attachToken);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);
export const resendOtp = (email) =>
  API.post('/auth/resendVerificationCode', { email });
export const verifyAccount = (data) =>
  API.post('/auth/verifyAccount', data);

// Student profile
export const completeStudentProfile = (payload) =>
  API.post('/auth/completeStudentProfile', payload);

// Teacher profile
export const completeTeacherProfile = (payload) =>
  API.patch('/auth/completeTeacherProfile', payload);

// ─── Lookups ──────────────────────────────────────────────────────────────────
export const saveStudentInterests = (payload) =>
  API.post('/auth/student/interests', payload);

export const saveTeacherDetails = (payload) =>
  API.post('/auth/teacher/details', payload);

export const getAccountState = () =>
  API.get('/auth/account-state');

export const getCountries = () =>
  API.get('/countries');

// ──────────────────────────────────────────────────────────────────────────────
// Curriculums
// ──────────────────────────────────────────────────────────────────────────────

export const getCurriculums = () =>
  API.get('/curriculums/');

export const getCurriculum = (id) =>
  API.get(`/curriculums/${id}`);

export const createCurriculum = (payload) =>
  API.post('/curriculums/', payload);

export const updateCurriculum = (id, payload) =>
  API.patch(`/curriculums/${id}`, payload);

export const deleteCurriculum = (id) =>
  API.delete(`/curriculums/${id}`);

// ──────────────────────────────────────────────────────────────────────────────
// Stages
// ──────────────────────────────────────────────────────────────────────────────

export const getCurriculumStages = (curriculumId) =>
  API.get(`/stages/curriculum/${curriculumId}`);

export const getStage = (stageId) =>
  API.get(`/stages/${stageId}`);

export const createStage = (payload) =>
  API.post('/stages', payload);

export const updateStage = (stageId, payload) =>
  API.patch(`/stages/${stageId}`, payload);

export const deleteStage = (stageId) =>
  API.delete(`/stages/${stageId}`);

// ──────────────────────────────────────────────────────────────────────────────
// Grades
// ──────────────────────────────────────────────────────────────────────────────

export const getStageGrades = (stageId) =>
  API.get('/grades', {
    params: {
      stage: stageId,
    },
  });

export const getAllGrades = (params) =>
  API.get('/grades', { params });

export const getGrade = (gradeId) =>
  API.get(`/grades/${gradeId}`);

export const createGrade = (payload) =>
  API.post('/grades', payload);

export const updateGrade = (gradeId, payload) =>
  API.patch(`/grades/${gradeId}`, payload);

export const deleteGrade = (gradeId) =>
  API.delete(`/grades/${gradeId}`);

// ──────────────────────────────────────────────────────────────────────────────
// Subjects
// ──────────────────────────────────────────────────────────────────────────────

export const getSubjects = (params) =>
  API.get('/subjects', { params });

export const getAllSubjects = (params) =>
  API.get('/subjects', { params });

// ─── Parent / Students ────────────────────────────────────────────────────────

export const removeStudent = (studentId) =>
  API.delete(`/parents/students/${studentId}`);

export const addStudent = (payload) =>
  API.post('/parents/students', payload);

export const getMyStudents = () =>
  API.get('/parents/students');

export const getStudentsStatistics = () =>
  API.get('/parents/students/statistics');

export const updateStudent = (studentId, payload) =>
  API.patch(`/parents/students/${studentId}`, payload);

// ─── User Profile ─────────────────────────────────────────────────────────────

export const getMyProfile = () =>
  API.get('/users/me');

export const updateMyProfile = (payload) =>
  API.patch('/users/me', payload);

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const createSubscription = (payload) =>
  API.post('/subscriptions', payload);

export const getAllSubscriptions = (params) =>
  API.get('/subscriptions/', { params });

export const getSubscription = (id) =>
  API.get(`/subscriptions/${id}`);

export const getStudentSubscriptionOptions = (studentId) =>
  API.get(`/subscriptions/students/${studentId}/subscription-options`);

export const getPendingSubscriptionRequests = () =>
  API.get('/subscriptions/students/pending');

export const getMyStudentsSubscriptions = () =>
  API.get('/parents/students/subscriptions');

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = () =>
  API.get('/notifications');

export const markNotificationRead = (id) =>
  API.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  API.patch('/notifications/read-all');


// ──────────────────────────────────────────────────────────────────────────────
// Users (Admin)
// ──────────────────────────────────────────────────────────────────────────────

export const getUsers = (params) =>
  API.get('/users/', { params });

export const getUser = (id) =>
  API.get(`/users/${id}`);

export const updateUser = (id, payload) =>
  API.patch(`/users/${id}`, payload);

export const deleteUser = (id) =>
  API.delete(`/users/${id}`);