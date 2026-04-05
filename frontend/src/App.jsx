import React, { useState, memo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LoadingProvider, useLoading } from './LoadingContext';
import LoadingScreen from './LoadingScreen';
import Layout from './Layout';
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

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  const portal = localStorage.getItem('ccs_portal') || '/student';
  return user ? children : <Navigate to={portal} replace />;
}

const AppRoutes = memo(function AppRoutes() {
  const { user, role } = useAuth();

  return (
    <Routes>
      {/* Separate login portals */}
      <Route path="/student"     element={user ? <Navigate to="/" replace /> : <LoginStudent />} />
      <Route path="/facultyadmin" element={user ? <Navigate to="/" replace /> : <LoginStaff />} />
      {/* Legacy /login → redirect to /student */}
      <Route path="/login" element={<Navigate to="/student" replace />} />
      <Route path="/*" element={
        <PrivateRoute>
          <Layout>
            <Routes>
              {/* ── Admin ── */}
              {role === 'admin' && <>
                <Route path="/" element={<DashboardAdmin />} />
                <Route path="/faculty-map" element={<FacultyDataMap />} />
                <Route path="/student-map" element={<StudentDataMap />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/search" element={<Search />} />
                <Route path="/subjects" element={<SubjectsMap />} />
                <Route path="/violations" element={<ViolationsMap />} />
                <Route path="/affiliations" element={<AffiliationsMap />} />
                <Route path="/skills" element={<SkillsMap />} />
                <Route path="/academic-records" element={<AcademicRecordsMap />} />
                <Route path="/non-academic-histories" element={<NonAcademicHistoriesMap />} />
                <Route path="/eligibility-criteria" element={<EligibilityCriteriaMap />} />
                <Route path="/faculty-reports" element={<AdminFacultyReports />} />
                <Route path="/faculty-evaluations" element={<AdminFacultyEvaluations />} />
                <Route path="/events" element={<AdminEvents />} />
                <Route path="/academic-period" element={<AcademicPeriodSettings />} />
                <Route path="/faculty-subject-assignment" element={<FacultySubjectAssignment />} />
              </>}

              {/* ── Teacher ── */}
              {role === 'teacher' && <>
                <Route path="/" element={<DashboardTeacher />} />
                <Route path="/eligibility-criteria" element={<EligibilityCriteriaMap />} />
                <Route path="/create-report" element={<TeacherCreateReport />} />
                <Route path="/my-evaluations" element={<TeacherMyEvaluations />} />
                <Route path="/my-subjects" element={<TeacherMySubjects />} />
                <Route path="/events" element={<Events />} />
                <Route path="/change-password" element={<ChangePassword />} />
              </>}

              {/* ── Student ── */}
              {role === 'student' && <>
                <Route path="/" element={<DashboardStudent />} />
                <Route path="/my-skills" element={<StudentSkills />} />
                <Route path="/my-affiliations" element={<StudentAffiliations />} />
                <Route path="/my-activities" element={<StudentNonAcademicActivities />} />
                <Route path="/evaluate-faculty" element={<StudentEvaluateFaculty />} />
                <Route path="/events" element={<Events />} />
                <Route path="/change-password" element={<ChangePassword />} />
              </>}

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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
