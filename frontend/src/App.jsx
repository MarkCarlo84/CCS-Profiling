import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LoadingProvider, useLoading } from './LoadingContext';
import LoadingScreen from './LoadingScreen';
import Layout from './Layout';
import Login from './pages/Login';

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
import OperationsCenter from './pages/OperationsCenter';

// Role dashboards
import DashboardTeacher from './pages/DashboardTeacher';
import DashboardStudent from './pages/DashboardStudent';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Inter',sans-serif", color: '#78716c' }}>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user, role } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
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
                <Route path="/operations" element={<OperationsCenter />} />
              </>}

              {/* ── Teacher ── */}
              {role === 'teacher' && <>
                <Route path="/" element={<DashboardTeacher />} />
                <Route path="/student-map" element={<StudentDataMap />} />
                <Route path="/violations" element={<ViolationsMap />} />
                <Route path="/affiliations" element={<AffiliationsMap />} />
                <Route path="/skills" element={<SkillsMap />} />
                <Route path="/academic-records" element={<AcademicRecordsMap />} />
                <Route path="/non-academic-histories" element={<NonAcademicHistoriesMap />} />
                <Route path="/eligibility-criteria" element={<EligibilityCriteriaMap />} />
                <Route path="/reports" element={<Reports />} />
              </>}

              {/* ── Student ── */}
              {role === 'student' && <>
                <Route path="/" element={<DashboardStudent />} />
              </>}

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

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
