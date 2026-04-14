import React, { useState, memo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LoadingProvider, useLoading } from './LoadingContext';
import LoadingScreen from './LoadingScreen';
import Layout from './Layout';
import KeepAliveRoutes from './KeepAliveRoutes';
import LoginStudent from './pages/LoginStudent';
import LoginStaff from './pages/LoginStaff';

// Admin pages
import DashboardAdmin from './pages/DashboardAdmin';
import FacultyDataMap from './pages/FacultyDataMap';
import StudentDataMap from './pages/StudentDataMap';
import Reports from './pages/Reports';
import Search from './pages/Search';
import SubjectsMap from './pages/SubjectsMap';
import ViolationsMap from './pages/ViolationsMap';
import AffiliationsMap from './pages/AffiliationsMap';
import SkillsMap from './pages/SkillsMap';
import AcademicRecordsMap from './pages/AcademicRecordsMap';
import NonAcademicHistoriesMap from './pages/NonAcademicHistoriesMap';
import EligibilityCriteriaMap from './pages/EligibilityCriteriaMap';
import AdminFacultyReports from './pages/AdminFacultyReports';
import AdminFacultyEvaluations from './pages/AdminFacultyEvaluations';
import AdminEvents from './pages/AdminEvents';
import AcademicPeriodSettings from './pages/AcademicPeriodSettings';
import FacultySubjectAssignment from './pages/FacultySubjectAssignment';
import Events from './pages/Events';
import StudentEvaluateFaculty from './pages/StudentEvaluateFaculty';

// Role dashboards
import DashboardTeacher from './pages/DashboardTeacher';
import DashboardStudent from './pages/DashboardStudent';
import ChangePassword from './pages/ChangePassword';
import StudentSkills from './pages/StudentSkills';
import StudentAffiliations from './pages/StudentAffiliations';
import StudentNonAcademicActivities from './pages/StudentNonAcademicActivities';
import TeacherCreateReport from './pages/TeacherCreateReport';
import TeacherMyEvaluations from './pages/TeacherMyEvaluations';
import TeacherMySubjects from './pages/TeacherMySubjects';
import MyProfile from './pages/MyProfile';
import AcademicTracker from './pages/AcademicTracker';
import SectionsMap from './pages/SectionsMap';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  const portal = localStorage.getItem('ccs_portal') || '/student';
  return user ? children : <Navigate to={portal} replace />;
}

const ROUTES_BY_ROLE = {
  admin: [
    { path: '/',                          element: <DashboardAdmin /> },
    { path: '/faculty-map',               element: <FacultyDataMap /> },
    { path: '/student-map',               element: <StudentDataMap /> },
    { path: '/sections',                  element: <SectionsMap /> },
    { path: '/reports',                   element: <Reports /> },
    { path: '/search',                    element: <Search /> },
    { path: '/subjects',                  element: <SubjectsMap /> },
    { path: '/violations',                element: <ViolationsMap /> },
    { path: '/affiliations',              element: <AffiliationsMap /> },
    { path: '/skills',                    element: <SkillsMap /> },
    { path: '/academic-records',          element: <AcademicRecordsMap /> },
    { path: '/non-academic-histories',    element: <NonAcademicHistoriesMap /> },
    { path: '/eligibility-criteria',      element: <EligibilityCriteriaMap /> },
    { path: '/faculty-reports',           element: <AdminFacultyReports /> },
    { path: '/faculty-evaluations',       element: <AdminFacultyEvaluations /> },
    { path: '/events',                    element: <AdminEvents /> },
    { path: '/academic-period',           element: <AcademicPeriodSettings /> },
    { path: '/faculty-subject-assignment',element: <FacultySubjectAssignment /> },
  ],
  teacher: [
    { path: '/',                     element: <DashboardTeacher /> },
    { path: '/eligibility-criteria', element: <EligibilityCriteriaMap /> },
    { path: '/create-report',        element: <TeacherCreateReport /> },
    { path: '/my-evaluations',       element: <TeacherMyEvaluations /> },
    { path: '/my-subjects',          element: <TeacherMySubjects /> },
    { path: '/events',               element: <Events /> },
    { path: '/change-password',      element: <ChangePassword /> },
  ],
  student: [
    { path: '/',                  element: <DashboardStudent /> },
    { path: '/my-profile',        element: <MyProfile /> },
    { path: '/my-academics',      element: <AcademicTracker /> },
    { path: '/my-skills',         element: <StudentSkills /> },
    { path: '/my-affiliations',   element: <StudentAffiliations /> },
    { path: '/my-activities',     element: <StudentNonAcademicActivities /> },
    { path: '/evaluate-faculty',  element: <StudentEvaluateFaculty /> },
    { path: '/events',            element: <Events /> },
    { path: '/change-password',   element: <ChangePassword /> },
  ],
};

const AppRoutes = memo(function AppRoutes() {
  const { user, role } = useAuth();
  const routes = ROUTES_BY_ROLE[role] ?? [];

  return (
    <Routes>
      {/* Login portals */}
      <Route path="/student"      element={user ? <Navigate to="/" replace /> : <LoginStudent />} />
      <Route path="/facultyadmin" element={user ? <Navigate to="/" replace /> : <LoginStaff />} />
      <Route path="/login"        element={<Navigate to="/student" replace />} />

      <Route path="/*" element={
        <PrivateRoute>
          <Layout>
            <KeepAliveRoutes routes={routes} />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
});

export default function App() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <LoadingProvider>
      {!introDone && <LoadingScreen onDone={() => setIntroDone(true)} />}
      <BrowserRouter>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </BrowserRouter>
    </LoadingProvider>
  );
}

function AppInner() {
  const { visible } = useLoading();
  return (
    <>
      {visible && <LoadingScreen />}
      <AppRoutes />
    </>
  );
}
