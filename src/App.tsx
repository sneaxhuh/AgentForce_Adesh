import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProgressPage from './pages/ProgressPage';
import NotesPage from './pages/NotesPage';
import SettingsPage from './pages/SettingsPage';
import CoursePage from './pages/CoursePage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/project-details" element={<Layout><ProjectDetailsPage /></Layout>} />
          <Route path="/progress" element={<Layout><ProgressPage /></Layout>} />
          <Route path="/notes" element={<Layout><NotesPage /></Layout>} />
          <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
          <Route path="/course" element={<Layout><CoursePage /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;