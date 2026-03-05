import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

export const getFaculties = (params = {}) => api.get('/faculties', { params });
export const getStudents = (params = {}) => api.get('/students', { params });
export const getDepartments = () => api.get('/departments');
export const getReportStudents = (params = {}) => api.get('/reports/students', { params });
export const getReportFaculties = (params = {}) => api.get('/reports/faculties', { params });
export const getSummary = () => api.get('/reports/summary');

export default api;
