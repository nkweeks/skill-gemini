import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
// import LoadingSpinner from './components/LoadingSpinner'; // Not used globally here

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import SkillsPage from './pages/SkillsPage';
import SkillDetailPage from './pages/SkillDetailPage';
import QuizzesPage from './pages/QuizzesPage';
import QuizDetailPage from './pages/QuizDetailPage';
import QuizAttemptPage from './pages/QuizAttemptPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage'; // Import LeaderboardPage

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSkillsPage from './pages/admin/skills/AdminSkillsPage';
import CreateSkillPage from './pages/admin/skills/CreateSkillPage';
import EditSkillPage from './pages/admin/skills/EditSkillPage';


import './App.css';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function AppContent() {
  return (
    <main style={{ padding: '0px' }}> {/* Changed padding to 0 as AdminLayout has its own */}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={<PublicRoute><LoginPage /></PublicRoute>}
        />
        <Route
          path="/register"
          element={<PublicRoute><RegisterPage /></PublicRoute>}
        />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/skills/:skill_id" element={<SkillDetailPage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes/:quiz_id" element={<QuizDetailPage />} />
          <Route path="/quizzes/:quiz_id/attempt" element={<QuizAttemptPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:task_id" element={<TaskDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin Routes - Nested under ProtectedRoute for basic auth, then AdminLayout */}
          {/* A more robust solution would use a specific AdminProtectedRoute */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} /> {/* Default admin page */}
            <Route path="skills" element={<AdminSkillsPage />} />
            <Route path="skills/new" element={<CreateSkillPage />} />
            <Route path="skills/:skill_id/edit" element={<EditSkillPage />} />
            {/* Add other admin routes here (e.g., for quizzes, tasks) */}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
