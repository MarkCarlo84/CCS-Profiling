import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import FacultyDataMap from './pages/FacultyDataMap';
import StudentDataMap from './pages/StudentDataMap';
import Reports from './pages/Reports';
import Curriculum from './pages/Curriculum';
import Syllabus from './pages/Syllabus';
import Courses from './pages/Courses';
import Rooms from './pages/Rooms';
import Scheduling from './pages/Scheduling';
import Events from './pages/Events';
import Search from './pages/Search';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/faculty-map" element={<FacultyDataMap />} />
          <Route path="/student-map" element={<StudentDataMap />} />
          <Route path="/reports" element={<Reports />} />

          {/* Instruction */}
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/syllabus" element={<Syllabus />} />

          {/* Scheduling */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/scheduling" element={<Scheduling />} />

          {/* Events */}
          <Route path="/events" element={<Events />} />

          {/* Comprehensive Search */}
          <Route path="/search" element={<Search />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
