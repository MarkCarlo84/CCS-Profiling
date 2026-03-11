import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

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

// ── Academic Records ──────────────────────────────────────────────────────────
export const getAcademicRecords = (params = {}) => api.get('/academic-records', { params });
export const getAcademicRecord = (id) => api.get(`/academic-records/${id}`);
export const createAcademicRecord = (data) => api.post('/academic-records', data);
export const updateAcademicRecord = (id, data) => api.put(`/academic-records/${id}`, data);
export const deleteAcademicRecord = (id) => api.delete(`/academic-records/${id}`);
export const calculateRecordGPA = (id) => api.get(`/academic-records/${id}/calculate-gpa`);
export const addGradeToRecord = (id, data) => api.post(`/academic-records/${id}/add-grade`, data);
export const getRecordGPA = (id) => api.get(`/academic-records/${id}/get-gpa`);

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

// ── Reports ───────────────────────────────────────────────────────────────────
export const getReportStudents = (params = {}) => api.get('/reports/students', { params });
export const getReportFaculties = (params = {}) => api.get('/reports/faculties', { params });
export const getSummary = () => api.get('/reports/summary');

// ── Comprehensive Search ──────────────────────────────────────────────────────
export const searchAll = async (query) => {
    const response = await api.get('/search', { params: { q: query } });
    const data = response.data;
    return { ...data, faculty: data.faculties };
};

export default api;