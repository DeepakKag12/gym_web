import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ExercisesPage from './pages/ExercisesPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import DietPage from './pages/DietPage';
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TransformationsPage from './pages/TransformationsPage';
import EnquiryPage from './pages/EnquiryPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';

// Member Pages
import MemberDashboard from './pages/member/Dashboard';
import MyNotifications from './pages/member/MyNotifications';
import MyOrders from './pages/member/MyOrders';
import MyProgress from './pages/member/MyProgress';
import MyWorkoutSplit from './pages/member/MyWorkoutSplit';
import MyExercises from './pages/member/MyExercises';
import MyDiet from './pages/member/MyDiet';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminMembers from './pages/admin/Members';
import AdminExercises from './pages/admin/Exercises';
import AdminDiet from './pages/admin/Diet';
import AdminStore from './pages/admin/Store';
import AdminTransformations from './pages/admin/Transformations';
import AdminEnquiries from './pages/admin/Enquiries';
import AdminOrders from './pages/admin/Orders';
import AdminTrainers from './pages/admin/Trainers';
import AdminAnalytics from './pages/admin/Analytics';
import AdminRevenue from './pages/admin/Revenue';
import AdminPlans from './pages/admin/Plans';
import AdminSplits from './pages/admin/Splits';
import AdminNotifications from './pages/admin/Notifications';

// Trainer Pages
import TrainerDashboard from './pages/trainer/Dashboard';

// Member bottom nav
import MemberBottomNav from './components/MemberBottomNav';

// ── Loading spinner ────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0f]">
      <div className="w-10 h-10 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── Route guards ───────────────────────────────────────────────────────────────

/**
 * ProtectedRoute: requires authentication.
 * Optionally restrict to specific roles via `roles` prop.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    // Send each role to its home panel instead of a blank redirect
    if (user.role === 'admin')   return <Navigate to="/admin" replace />;
    if (user.role === 'trainer') return <Navigate to="/trainer" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

/**
 * AdminRoute: shorthand for admin + trainer combined routes.
 */
const AdminRoute = ({ children, allowTrainer = false }) => (
  <ProtectedRoute roles={allowTrainer ? ['admin', 'trainer'] : ['admin']}>
    {children}
  </ProtectedRoute>
);

/**
 * GuestRoute: redirects already-logged-in users away from /login.
 */
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) {
    if (user.role === 'admin')   return <Navigate to="/admin" replace />;
    if (user.role === 'trainer') return <Navigate to="/trainer" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ── Routes that hide the global Navbar + Footer ────────────────────────────────
const ADMIN_PREFIX   = '/admin';
const TRAINER_PREFIX = '/trainer';

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  const isAdminRoute  = location.pathname.startsWith(ADMIN_PREFIX) || location.pathname.startsWith(TRAINER_PREFIX);
  const isMemberRoute = !isAdminRoute && user?.role === 'member';

  return (
    <>
      {/* Global navbar — hidden on admin / trainer panel */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* ── Public ── */}
        <Route path="/"                   element={<HomePage />} />
        <Route path="/about"              element={<AboutPage />} />
        <Route path="/exercises"          element={<ExercisesPage />} />
        <Route path="/exercises/:id"      element={<ExerciseDetailPage />} />
        <Route path="/diet"               element={<DietPage />} />
        <Route path="/store"              element={<StorePage />} />
        <Route path="/store/:id"          element={<ProductDetailPage />} />
        <Route path="/cart"               element={<CartPage />} />
        <Route path="/checkout"           element={<CheckoutPage />} />
        <Route path="/transformations"    element={<TransformationsPage />} />
        <Route path="/enquiry"            element={<EnquiryPage />} />

        {/* ── Guest-only (redirect logged-in users away) ── */}
        <Route path="/login"              element={<GuestRoute><LoginPage /></GuestRoute>} />

        {/* ── Authenticated (all roles) ── */}
        <Route path="/settings"           element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/notifications"      element={<ProtectedRoute><MyNotifications /></ProtectedRoute>} />

        {/* ── Member ── */}
        <Route path="/dashboard"          element={<ProtectedRoute roles={['member']}><MemberDashboard /></ProtectedRoute>} />
        <Route path="/my-orders"          element={<ProtectedRoute roles={['member']}><MyOrders /></ProtectedRoute>} />
        <Route path="/my-progress"        element={<ProtectedRoute roles={['member']}><MyProgress /></ProtectedRoute>} />
        <Route path="/my-workout"         element={<ProtectedRoute roles={['member']}><MyWorkoutSplit /></ProtectedRoute>} />
        <Route path="/my-planner"         element={<Navigate to="/my-workout" replace />} />
        <Route path="/my-exercises"       element={<ProtectedRoute roles={['member']}><MyExercises /></ProtectedRoute>} />
        <Route path="/my-diet"            element={<ProtectedRoute roles={['member']}><MyDiet /></ProtectedRoute>} />

        {/* ── Trainer ── */}
        <Route path="/trainer"            element={<ProtectedRoute roles={['trainer']}><TrainerDashboard /></ProtectedRoute>} />

        {/* ── Admin ── */}
        <Route path="/admin"                    element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/members"            element={<AdminRoute><AdminMembers /></AdminRoute>} />
        <Route path="/admin/exercises"          element={<AdminRoute allowTrainer><AdminExercises /></AdminRoute>} />
        <Route path="/admin/diet"               element={<AdminRoute allowTrainer><AdminDiet /></AdminRoute>} />
        <Route path="/admin/store"              element={<AdminRoute><AdminStore /></AdminRoute>} />
        <Route path="/admin/transformations"    element={<AdminRoute allowTrainer><AdminTransformations /></AdminRoute>} />
        <Route path="/admin/enquiries"          element={<AdminRoute><AdminEnquiries /></AdminRoute>} />
        <Route path="/admin/orders"             element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/trainers"           element={<AdminRoute><AdminTrainers /></AdminRoute>} />
        <Route path="/admin/analytics"          element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
        <Route path="/admin/revenue"            element={<AdminRoute><AdminRevenue /></AdminRoute>} />
        <Route path="/admin/plans"              element={<AdminRoute><AdminPlans /></AdminRoute>} />
        <Route path="/admin/splits"             element={<AdminRoute allowTrainer><AdminSplits /></AdminRoute>} />
        <Route path="/admin/notifications"      element={<AdminRoute><AdminNotifications /></AdminRoute>} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global footer — hidden on admin / trainer panel */}
      {!isAdminRoute && <Footer />}

      {/* Member bottom navigation (mobile only) */}
      {isMemberRoute && <MemberBottomNav />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
