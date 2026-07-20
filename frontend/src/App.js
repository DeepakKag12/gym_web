import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MemberBottomNav from './components/MemberBottomNav';

// ── Lazy-loaded pages (code-splitting for faster initial load) ─────────────────
// Public
const HomePage            = lazy(() => import('./pages/HomePage'));
const AboutPage           = lazy(() => import('./pages/AboutPage'));
const ExercisesPage       = lazy(() => import('./pages/ExercisesPage'));
const ExerciseDetailPage  = lazy(() => import('./pages/ExerciseDetailPage'));
const DietPage            = lazy(() => import('./pages/DietPage'));
const StorePage           = lazy(() => import('./pages/StorePage'));
const ProductDetailPage   = lazy(() => import('./pages/ProductDetailPage'));
const CartPage            = lazy(() => import('./pages/CartPage'));
const CheckoutPage        = lazy(() => import('./pages/CheckoutPage'));
const TransformationsPage = lazy(() => import('./pages/TransformationsPage'));
const EnquiryPage         = lazy(() => import('./pages/EnquiryPage'));
const LoginPage           = lazy(() => import('./pages/LoginPage'));
const SettingsPage        = lazy(() => import('./pages/SettingsPage'));

// Member
const MemberDashboard  = lazy(() => import('./pages/member/Dashboard'));
const MyNotifications  = lazy(() => import('./pages/member/MyNotifications'));
const MyOrders         = lazy(() => import('./pages/member/MyOrders'));
const MyProgress       = lazy(() => import('./pages/member/MyProgress'));
const MyWorkoutSplit   = lazy(() => import('./pages/member/MyWorkoutSplit'));
const MyExercises      = lazy(() => import('./pages/member/MyExercises'));
const MyDiet           = lazy(() => import('./pages/member/MyDiet'));

// Admin
const AdminDashboard      = lazy(() => import('./pages/admin/Dashboard'));
const AdminMembers        = lazy(() => import('./pages/admin/Members'));
const AdminExercises      = lazy(() => import('./pages/admin/Exercises'));
const AdminDiet           = lazy(() => import('./pages/admin/Diet'));
const AdminStore          = lazy(() => import('./pages/admin/Store'));
const AdminTransformations= lazy(() => import('./pages/admin/Transformations'));
const AdminEnquiries      = lazy(() => import('./pages/admin/Enquiries'));
const AdminOrders         = lazy(() => import('./pages/admin/Orders'));
const AdminTrainers       = lazy(() => import('./pages/admin/Trainers'));
const AdminAnalytics      = lazy(() => import('./pages/admin/Analytics'));
const AdminRevenue        = lazy(() => import('./pages/admin/Revenue'));
const AdminPlans          = lazy(() => import('./pages/admin/Plans'));
const AdminSplits         = lazy(() => import('./pages/admin/Splits'));
const AdminNotifications  = lazy(() => import('./pages/admin/Notifications'));

// Trainer
const TrainerDashboard = lazy(() => import('./pages/trainer/Dashboard'));

// ── Page-change scroll-to-top ──────────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// ── Full-screen loading spinner (shown while lazy chunks load) ─────────────────
function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-600 text-xs">Loading…</span>
      </div>
    </div>
  );
}

// ── Route guards ───────────────────────────────────────────────────────────────

/**
 * ProtectedRoute — requires authentication.
 * Optionally restrict to specific roles via `roles` prop.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin')   return <Navigate to="/admin" replace />;
    if (user.role === 'trainer') return <Navigate to="/trainer" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

/** AdminRoute — shorthand for admin-only or admin+trainer routes. */
const AdminRoute = ({ children, allowTrainer = false }) => (
  <ProtectedRoute roles={allowTrainer ? ['admin', 'trainer'] : ['admin']}>
    {children}
  </ProtectedRoute>
);

/** GuestRoute — redirects already-logged-in users away from /login. */
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
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
      <ScrollToTop />

      {/* Global navbar — hidden on admin / trainer panel */}
      {!isAdminRoute && <Navbar />}

      <Suspense fallback={<PageSpinner />}>
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

          {/* ── Guest-only ── */}
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
      </Suspense>

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
