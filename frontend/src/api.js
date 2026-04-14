import axios from 'axios';

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
export const getFaculties = (params = {}) => api.get('/faculties', { params });
export const getFaculty = (id) => api.get(`/faculties/${id}`);
export const createFaculty = (data) => api.post('/faculties', data);
export const updateFaculty = (id, data) => api.put(`/faculties/${id}`, data);
export const deleteFaculty = (id) => api.delete(`/faculties/${id}`);

// Faculty class diagram operations
export const facultyCreateReport = (facultyId, criteriaId) => api.post(`/faculties/${facultyId}/create-report/${criteriaId}`);
export const facultyEvaluateStudent = (facultyId, studentId) => api.get(`/faculties/${facultyId}/evaluate-student/${studentId}`);
export const facultyRecordViolation = (facultyId, studentId, data) => api.post(`/faculties/${facultyId}/record-violation/${studentId}`, data);
export const facultyUpdateStudentRecord = (facultyId, studentId, data) => api.patch(`/faculties/${facultyId}/update-student/${studentId}`, data);

// ── Students ──────────────────────────────────────────────────────────────────
export const getStudents = (params = {}) => api.get('/students', { params });
export const getStudent = (id) => api.get(`/students/${id}`);
export const getSectionCapacity = (department, year_level) => api.get('/students/section-capacity', { params: { department, year_level } });
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Student class diagram operations
export const studentUpdateProfile = (id, data) => api.patch(`/students/${id}/update-profile`, data);
export const studentAddViolation = (id, data) => api.post(`/students/${id}/violations`, data);
export const studentAddAffiliation = (id, data) => api.post(`/students/${id}/affiliations`, data);
export const studentAddSkill = (id, data) => api.post(`/students/${id}/skills`, data);
export const studentAddAcademicRecord = (id, data) => api.post(`/students/${id}/academic-records`, data);

// ── Subjects ──────────────────────────────────────────────────────────────────
export const getSubjects = (params = {}) => api.get('/subjects', { params });
export const getSubject = (id) => api.get(`/subjects/${id}`);
export const createSubject = (data) => api.post('/subjects', data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);
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
export const getAffiliations = (params = {}) => api.get('/affiliations', { params });
export const getAffiliation = (id) => api.get(`/affiliations/${id}`);
export const createAffiliation = (data) => api.post('/affiliations', data);
export const updateAffiliation = (id, data) => api.put(`/affiliations/${id}`, data);
export const deleteAffiliation = (id) => api.delete(`/affiliations/${id}`);
export const getAffiliationDetails = (id) => api.get(`/affiliations/${id}/details`);

// ── Violations ────────────────────────────────────────────────────────────────
export const getViolations = (params = {}) => api.get('/violations', { params });
export const getViolation = (id) => api.get(`/violations/${id}`);
export const createViolation = (data) => api.post('/violations', data);
export const updateViolation = (id, data) => api.put(`/violations/${id}`, data);
export const deleteViolation = (id) => api.delete(`/violations/${id}`);
export const getViolationDetails = (id) => api.get(`/violations/${id}/details`);
export const updateViolationAction = (id, action) => api.patch(`/violations/${id}/update-action`, { action_taken: action });
export const resolveViolation = (id) => api.patch(`/violations/${id}/resolve`);

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
export const getSkills = (params = {}) => api.get('/skills', { params });
export const getSkill = (id) => api.get(`/skills/${id}`);
export const createSkill = (data) => api.post('/skills', data);
export const updateSkill = (id, data) => api.put(`/skills/${id}`, data);
export const deleteSkill = (id) => api.delete(`/skills/${id}`);
export const getSkillLevel = (id) => api.get(`/skills/${id}/level`);
export const updateSkillLevel = (id, level) => api.patch(`/skills/${id}/level`, { skill_level: level });

// ── Non-Academic Histories ────────────────────────────────────────────────────
export const getNonAcademicHistories = (params = {}) => api.get('/non-academic-histories', { params });
export const getNonAcademicHistory = (id) => api.get(`/non-academic-histories/${id}`);
export const createNonAcademicHistory = (data) => api.post('/non-academic-histories', data);
export const updateNonAcademicHistory = (id, data) => api.put(`/non-academic-histories/${id}`, data);
export const deleteNonAcademicHistory = (id) => api.delete(`/non-academic-histories/${id}`);
export const getNonAcademicDetails = (id) => api.get(`/non-academic-histories/${id}/details`);
export const updateNonAcademicActivity = (id, description) => api.patch(`/non-academic-histories/${id}/update-activity`, { description });

// ── Departments ───────────────────────────────────────────────────────────────
export const getDepartments = () => api.get('/departments');

// ── Reports ───────────────────────────────────────────────────────────────────
export const getReportStudents = (params = {}) => api.get('/reports/students', { params });
export const getReportFaculties = (params = {}) => api.get('/reports/faculties', { params });
export const getSummary = () => api.get('/reports/summary');
export const getReportPresets = () => api.get('/reports/presets');

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