import axios from 'axios';
import { cached, invalidate, invalidatePrefix, clearCache } from './cache';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Always attach token from sessionStorage on every request
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('ccs_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
});

// ── OTP ───────────────────────────────────────────────────────────────────────
export const sendOtp         = (action, email) => api.post('/otp/send', { action, email });
export const verifyOtp       = (otp, action, email) => api.post('/otp/verify', { otp, action, email });
export const verifyLoginOtp  = (email, otp) => api.post('/auth/verify-login-otp', { email, otp });
export const studentLogin    = (student_id, password) => api.post('/auth/student-login', { student_id, password });
export const staffLogin      = (identifier, password) => api.post('/auth/staff-login', { identifier, password });
export const changePassword  = (current_password, new_password, new_password_confirmation) =>
    api.post('/auth/change-password', { current_password, new_password, new_password_confirmation });

// ── Faculty ──────────────────────────────────────────────────────────────────
export const getFaculties = (params = {}) => {
    const key = `faculties?${new URLSearchParams(params).toString()}`;
    return cached(key, () => api.get('/faculties', { params }), 120);
};
export const getFaculty = (id) => api.get(`/faculties/${id}`);
export const createFaculty = (data) => api.post('/faculties', data).then(r => { invalidatePrefix('faculties'); invalidate('reports/summary'); return r; });
export const updateFaculty = (id, data) => api.put(`/faculties/${id}`, data).then(r => { invalidatePrefix('faculties'); invalidate('reports/summary'); return r; });
export const deleteFaculty = (id) => api.delete(`/faculties/${id}`).then(r => { invalidatePrefix('faculties'); invalidate('reports/summary'); return r; });

// Faculty class diagram operations
export const facultyCreateReport = (facultyId, criteriaId) => api.post(`/faculties/${facultyId}/create-report/${criteriaId}`);
export const facultyEvaluateStudent = (facultyId, studentId) => api.get(`/faculties/${facultyId}/evaluate-student/${studentId}`);
export const facultyRecordViolation = (facultyId, studentId, data) => api.post(`/faculties/${facultyId}/record-violation/${studentId}`, data);
export const facultyUpdateStudentRecord = (facultyId, studentId, data) => api.patch(`/faculties/${facultyId}/update-student/${studentId}`, data);

// ── Students ──────────────────────────────────────────────────────────────────
export const getStudents = (params = {}) => {
    const key = `students?${new URLSearchParams(params).toString()}`;
    return cached(key, () => api.get('/students', { params }), 120);
};
export const getStudent = (id) => api.get(`/students/${id}`);
export const getSectionCapacity = (department, year_level) => api.get('/students/section-capacity', { params: { department, year_level } });
export const createStudent = (data) => api.post('/students', data).then(r => { invalidatePrefix('students'); invalidate('reports/summary'); return r; });
export const updateStudent = (id, data) => api.put(`/students/${id}`, data).then(r => { invalidatePrefix('students'); return r; });
export const deleteStudent = (id) => api.delete(`/students/${id}`).then(r => { invalidatePrefix('students'); invalidate('reports/summary'); return r; });

// Student class diagram operations
export const studentUpdateProfile = (id, data) => api.patch(`/students/${id}/update-profile`, data);
export const studentAddViolation = (id, data) => api.post(`/students/${id}/violations`, data);
export const studentAddAffiliation = (id, data) => api.post(`/students/${id}/affiliations`, data);
export const studentAddSkill = (id, data) => api.post(`/students/${id}/skills`, data);
export const studentAddAcademicRecord = (id, data) => api.post(`/students/${id}/academic-records`, data);

// ── Subjects ──────────────────────────────────────────────────────────────────
export const getSubjects = (params = {}) => {
    const key = `subjects?${new URLSearchParams(params).toString()}`;
    return cached(key, () => api.get('/subjects', { params }), 300);
};
export const getSubject = (id) => api.get(`/subjects/${id}`);
export const createSubject = (data) => api.post('/subjects', data).then(r => { invalidatePrefix('subjects'); return r; });
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data).then(r => { invalidatePrefix('subjects'); return r; });
export const deleteSubject = (id) => api.delete(`/subjects/${id}`).then(r => { invalidatePrefix('subjects'); return r; });
export const getSubjectInfo = (id) => api.get(`/subjects/${id}/info`);

// ── Grades ────────────────────────────────────────────────────────────────────
export const getGrades = (params = {}) => api.get('/grades', { params });
export const getGrade = (id) => api.get(`/grades/${id}`);
export const createGrade = (data) => api.post('/grades', data);
export const updateGrade = (id, data) => api.put(`/grades/${id}`, data);
export const deleteGrade = (id) => api.delete(`/grades/${id}`);
export const computeGradeRemarks = (id) => api.get(`/grades/${id}/compute-remarks`);
export const getGradeScore = (id) => api.get(`/grades/${id}/get-score`);

// ── Eligibility Criteria ──────────────────────────────────────────────────────
export const getEligibilityCriteria = () => api.get('/eligibility-criteria');
export const getEligibilityCriterion = (id) => api.get(`/eligibility-criteria/${id}`);
export const createEligibilityCriteria = (data) => api.post('/eligibility-criteria', data);
export const updateEligibilityCriteria = (id, data) => api.put(`/eligibility-criteria/${id}`, data);
export const deleteEligibilityCriteria = (id) => api.delete(`/eligibility-criteria/${id}`);
export const evaluateStudentForCriteria = (criteriaId, studentId) => api.get(`/eligibility-criteria/${criteriaId}/evaluate/${studentId}`);

// ── Affiliations ──────────────────────────────────────────────────────────────
export const getAffiliations = (params = {}) => {
    const key = `affiliations?${new URLSearchParams(params).toString()}`;
    return cached(key, () => api.get('/affiliations', { params }), 120);
};
export const getAffiliation = (id) => api.get(`/affiliations/${id}`);
export const createAffiliation = (data) => api.post('/affiliations', data).then(r => { invalidatePrefix('affiliations'); return r; });
export const updateAffiliation = (id, data) => api.put(`/affiliations/${id}`, data).then(r => { invalidatePrefix('affiliations'); return r; });
export const deleteAffiliation = (id) => api.delete(`/affiliations/${id}`).then(r => { invalidatePrefix('affiliations'); return r; });
export const getAffiliationDetails = (id) => api.get(`/affiliations/${id}/details`);

// ── Violations ────────────────────────────────────────────────────────────────
export const getViolations = (params = {}) => {
    const key = `violations?${new URLSearchParams(params).toString()}`;
    return cached(key, () => api.get('/violations', { params }), 120);
};
export const getViolation = (id) => api.get(`/violations/${id}`);
export const createViolation = (data) => api.post('/violations', data).then(r => { invalidatePrefix('violations'); invalidatePrefix('students'); return r; });
export const updateViolation = (id, data) => api.put(`/violations/${id}`, data).then(r => { invalidatePrefix('violations'); return r; });
export const deleteViolation = (id) => api.delete(`/violations/${id}`).then(r => { invalidatePrefix('violations'); return r; });
export const getViolationDetails = (id) => api.get(`/violations/${id}/details`);
export const updateViolationAction = (id, action) => api.patch(`/violations/${id}/update-action`, { action_taken: action }).then(r => { invalidatePrefix('violations'); return r; });
export const resolveViolation = (id) => api.patch(`/violations/${id}/resolve`).then(r => { invalidatePrefix('violations'); return r; });

// ── Academic Records ──────────────────────────────────────────────────────────
export const getAcademicRecords = (params = {}) => api.get('/academic-records', { params });
export const getAcademicRecord = (id) => api.get(`/academic-records/${id}`);
export const createAcademicRecord = (data) => api.post('/admin/academic-records', data);
export const updateAcademicRecord = (id, data) => api.patch(`/admin/academic-records/${id}`, data);
export const deleteAcademicRecord = (id) => api.delete(`/admin/academic-records/${id}`);
export const calculateRecordGPA = (id) => api.get(`/academic-records/${id}/calculate-gpa`);
export const addGradeToRecord = (id, data) => api.post(`/admin/academic-records/${id}/add-grade`, data);
export const getRecordGPA = (id) => api.get(`/academic-records/${id}/get-gpa`);
// Admin: enroll subjects & promote
export const adminEnrollSubjects = (studentId, data) => api.post(`/admin/students/${studentId}/enroll-subjects`, data);
export const adminPromoteStudent = (studentId, data) => api.post(`/admin/students/${studentId}/promote`, data);
// Admin: grade management
export const adminUpdateGrade = (id, data) => api.patch(`/admin/grades/${id}`, data);
export const adminDeleteGrade = (id) => api.delete(`/admin/grades/${id}`);

// ── Skills ────────────────────────────────────────────────────────────────────
export const getSkills = (params = {}) => {
    const key = `skills?${new URLSearchParams(params).toString()}`;
    return cached(key, () => api.get('/skills', { params }), 120);
};
export const getSkill = (id) => api.get(`/skills/${id}`);
export const createSkill = (data) => api.post('/skills', data).then(r => { invalidatePrefix('skills'); invalidate('reports/presets'); return r; });
export const updateSkill = (id, data) => api.put(`/skills/${id}`, data).then(r => { invalidatePrefix('skills'); return r; });
export const deleteSkill = (id) => api.delete(`/skills/${id}`).then(r => { invalidatePrefix('skills'); invalidate('reports/presets'); return r; });
export const getSkillLevel = (id) => api.get(`/skills/${id}/level`);
export const updateSkillLevel = (id, level) => api.patch(`/skills/${id}/level`, { skill_level: level }).then(r => { invalidatePrefix('skills'); return r; });

// ── Non-Academic Histories ────────────────────────────────────────────────────
export const getNonAcademicHistories = (params = {}) => {
    const key = `non-academic-histories?${new URLSearchParams(params).toString()}`;
    return cached(key, () => api.get('/non-academic-histories', { params }), 120);
};
export const getNonAcademicHistory = (id) => api.get(`/non-academic-histories/${id}`);
export const createNonAcademicHistory = (data) => api.post('/non-academic-histories', data).then(r => { invalidatePrefix('non-academic-histories'); return r; });
export const updateNonAcademicHistory = (id, data) => api.put(`/non-academic-histories/${id}`, data).then(r => { invalidatePrefix('non-academic-histories'); return r; });
export const deleteNonAcademicHistory = (id) => api.delete(`/non-academic-histories/${id}`).then(r => { invalidatePrefix('non-academic-histories'); return r; });
export const getNonAcademicDetails = (id) => api.get(`/non-academic-histories/${id}/details`);
export const updateNonAcademicActivity = (id, description) => api.patch(`/non-academic-histories/${id}/update-activity`, { description }).then(r => { invalidatePrefix('non-academic-histories'); return r; });

// ── Departments ───────────────────────────────────────────────────────────────
export const getDepartments = () => cached('departments', () => api.get('/departments'), 600);

// ── Reports ───────────────────────────────────────────────────────────────────
export const getReportStudents = (params = {}) => api.get('/reports/students', { params });
export const getReportFaculties = (params = {}) => api.get('/reports/faculties', { params });
export const getSummary = () => cached('reports/summary', () => api.get('/reports/summary'), 300);
export const getReportPresets = () => cached('reports/presets', () => api.get('/reports/presets'), 600);

// ── Teacher Profile ───────────────────────────────────────────────────────────
export const getTeacherProfile   = () => api.get('/teacher/profile');
export const updateTeacherProfile = (data) => api.patch('/teacher/profile', data);

// ── Teacher Reports (written) ─────────────────────────────────────────────────
export const getTeacherReports = () => api.get('/teacher/reports');
export const createTeacherReport = (data) => api.post('/teacher/reports', data);
export const updateTeacherReport = (id, data) => api.patch(`/teacher/reports/${id}`, data);
export const deleteTeacherReport = (id) => api.delete(`/teacher/reports/${id}`);

// ── Admin: All Faculty Reports ────────────────────────────────────────────────
export const getAllFacultyReports = () => api.get('/admin/faculty-reports');

// ── Admin: Faculty Evaluations ────────────────────────────────────────────────
export const getAdminFacultyEvaluations = (params = {}) => api.get('/admin/faculty-evaluations', { params });
export const getAdminFacultyEvaluationSummary = () => api.get('/admin/faculty-evaluations/summary');

// ── Student: Faculty Evaluations ──────────────────────────────────────────────
export const getStudentEvaluations = () => api.get('/student/evaluations');
export const getEvaluableFaculties = () => api.get('/student/evaluations/faculties');
export const submitFacultyEvaluation = (data) => api.post('/student/evaluations', data);

// ── Teacher: My Evaluations (anonymous) ───────────────────────────────────────
export const getMyEvaluations = () => api.get('/teacher/my-evaluations');

// ── Comprehensive Search ──────────────────────────────────────────────────────
export const searchAll = async (query) => {
    const response = await api.get('/search', { params: { q: query } });
    return response;
};

export default api;