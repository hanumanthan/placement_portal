import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import StudentLogin from './pages/auth/StudentLogin';
import StudentRegister from './pages/auth/StudentRegister';
import AdminLogin from './pages/auth/AdminLogin';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentCompanies from './pages/student/StudentCompanies';
import StudentCompanyDetail from './pages/student/StudentCompanyDetail';
import StudentApplications from './pages/student/StudentApplications';
import StudentTests from './pages/student/StudentTests';
import StudentTestTaker from './pages/student/StudentTestTaker';
import StudentTestResult from './pages/student/StudentTestResult';
import StudentChallenges from './pages/student/StudentChallenges';
import StudentVocabulary from './pages/student/StudentVocabulary';
import StudentQuestions from './pages/student/StudentQuestions';
import StudentExperiences from './pages/student/StudentExperiences';
import StudentVideos from './pages/student/StudentVideos';
import StudentResources from './pages/student/StudentResources';
import StudentCodingPractice from './pages/student/StudentCodingPractice';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminDrives from './pages/admin/AdminDrives';
import AdminApplications from './pages/admin/AdminApplications';
import AdminTests from './pages/admin/AdminTests';
import AdminChallenges from './pages/admin/AdminChallenges';
import AdminVocabulary from './pages/admin/AdminVocabulary';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminExperiences from './pages/admin/AdminExperiences';
import AdminVideos from './pages/admin/AdminVideos';
import AdminResources from './pages/admin/AdminResources';
import AdminStudents from './pages/admin/AdminStudents';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCodingQuestions from './pages/admin/AdminCodingQuestions';

function RootRedirect() {
  const { role, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '14px',
                borderRadius: '8px',
              },
            }}
          />
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/register" element={<StudentRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Student Portal Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="companies" element={<StudentCompanies />} />
              <Route path="companies/:id" element={<StudentCompanyDetail />} />
              <Route path="applications" element={<StudentApplications />} />
              <Route path="tests" element={<StudentTests />} />
              <Route path="tests/results/:attemptId" element={<StudentTestResult />} />
              <Route path="challenges" element={<StudentChallenges />} />
              <Route path="vocabulary" element={<StudentVocabulary />} />
              <Route path="questions" element={<StudentQuestions />} />
              <Route path="experiences" element={<StudentExperiences />} />
              <Route path="videos" element={<StudentVideos />} />
              <Route path="resources" element={<StudentResources />} />
              <Route path="coding" element={<StudentCodingPractice />} />
            </Route>

            {/* Standalone Fullscreen Test Taker for Distraction-free Exam Environment */}
            <Route
              path="/student/tests/taker/:attemptId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentTestTaker />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Portal Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="drives" element={<AdminDrives />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="tests" element={<AdminTests />} />
              <Route path="challenges" element={<AdminChallenges />} />
              <Route path="vocabulary" element={<AdminVocabulary />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="questions" element={<AdminQuestions />} />
              <Route path="experiences" element={<AdminExperiences />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="resources" element={<AdminResources />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="coding" element={<AdminCodingQuestions />} />
            </Route>

            {/* Root Navigation */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
