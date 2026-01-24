import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AdminRoute, PublicOnlyRoute } from './components/ProtectedRoute';

// Layouts
import { AdminLayout, PublicLayout, DepartmentLayout } from './components/layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Public Pages
import Home from './pages/public/Home';
import Events from './pages/public/Events';
import EventDetails from './pages/public/EventDetails';
import EventRegister from './pages/public/EventRegister';
import PaymentSuccess from './pages/public/PaymentSuccess';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageEvents from './pages/admin/ManageEvents';
import CreateEvent from './pages/admin/CreateEvent';
import EditEvent from './pages/admin/EditEvent';
import Participants from './pages/admin/Participants';
import ParticipantDetails from './pages/admin/ParticipantDetails';
import Attendance from './pages/admin/Attendance';
import Payments from './pages/admin/Payments';
import Certificates from './pages/admin/Certificates';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import Departments from './pages/admin/Departments';
import Registrations from './pages/admin/Registrations';
import Winners from './pages/admin/Winners';

// Judge Pages
import JudgeLogin from './pages/judge/JudgeLogin';
import JudgeDashboard from './pages/judge/JudgeDashboard';

// Department Pages
import {
  DepartmentLogin,
  DepartmentDashboard,
  DepartmentEvents,
  StudentRegistration,
  MyRegistrations,
  LiveScores,
  DepartmentResults,
  DepartmentCertificates,
} from './pages/department';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/events/:eventId/register" element={<EventRegister />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="events/:eventId/edit" element={<EditEvent />} />
            <Route path="participants" element={<Participants />} />
            <Route path="participants/:participantId" element={<ParticipantDetails />} />
            <Route path="attendance" element={<Attendance />} />
            {/* <Route path="payments" element={<Payments />} /> */}
            <Route path="certificates" element={<Certificates />} />
            {/* <Route path="analytics" element={<Analytics />} /> */}
            <Route path="settings" element={<Settings />} />
            <Route path="departments" element={<Departments />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="winners" element={<Winners />} />
          </Route>

          {/* Judge Routes */}
          <Route path="/judge/login" element={<JudgeLogin />} />
          <Route path="/judge/dashboard" element={<JudgeDashboard />} />

          {/* Department Routes */}
          <Route path="/department/login" element={<DepartmentLogin />} />
          <Route path="/department/register" element={<StudentRegistration />} />
          <Route path="/department" element={<DepartmentLayout />}>
            <Route index element={<Navigate to="/department/dashboard" replace />} />
            <Route path="dashboard" element={<DepartmentDashboard />} />
            <Route path="events" element={<DepartmentEvents />} />
            <Route path="registrations" element={<MyRegistrations />} />
            <Route path="live-scores" element={<LiveScores />} />
            <Route path="results" element={<DepartmentResults />} />
            <Route path="certificates" element={<DepartmentCertificates />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E3A5F',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
