
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ScrollToTop from './components/shared/ScrollToTop';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import PublicServicesPage from './pages/public/ServicesPage';
import FeaturesPage from './pages/public/FeaturesPage';
import AboutPage from './pages/public/AboutPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ServicesPage from './pages/student/ServicesPage';
import JoinQueuePage from './pages/student/JoinQueuePage';
import MyTokenPage from './pages/student/MyTokenPage';
import NotificationsPage from './pages/student/NotificationsPage';
import QueueHistoryPage from './pages/student/QueueHistoryPage';
import StudentProfile from './pages/student/StudentProfile';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import LiveQueuePage from './pages/staff/LiveQueuePage';
import CounterPage from './pages/staff/CounterPage';
import StaffHistoryPage from './pages/staff/StaffHistoryPage';
import StaffProfile from './pages/staff/StaffProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import StaffManagement from './pages/admin/StaffManagement';
import QueueAnalytics from './pages/admin/QueueAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

// Common Pages
import AIAssistantPage from './pages/common/AIAssistantPage';

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<PublicServicesPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Student Routes (Public, No Login Required) */}
        <Route path="/student" element={<DashboardLayout role="student" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="join-queue/:serviceId" element={<JoinQueuePage />} />
          <Route path="my-token" element={<MyTokenPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="history" element={<QueueHistoryPage />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><DashboardLayout role="staff" /></ProtectedRoute>}>
          <Route index element={<StaffDashboard />} />
          <Route path="live-queue" element={<LiveQueuePage />} />
          <Route path="counter" element={<CounterPage />} />
          <Route path="history" element={<StaffHistoryPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="analytics" element={<QueueAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
