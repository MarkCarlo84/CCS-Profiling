import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Inter',sans-serif", color: '#78716c' }}>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={
        <PrivateRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/faculty-map" element={<FacultyDataMap />} />
              <Route path="/student-map" element={<StudentDataMap />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/search" element={<Search />} />
              {/* Record maps */}
              <Route path="/subjects" element={<SubjectsMap />} />
              <Route path="/violations" element={<ViolationsMap />} />
              <Route path="/affiliations" element={<AffiliationsMap />} />
              <Route path="/skills" element={<SkillsMap />} />
              <Route path="/academic-records" element={<AcademicRecordsMap />} />
              <Route path="/non-academic-histories" element={<NonAcademicHistoriesMap />} />
              <Route path="/eligibility-criteria" element={<EligibilityCriteriaMap />} />
              <Route path="/operations" element={<OperationsCenter />} />
            </Routes>
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
