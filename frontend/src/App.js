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

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0f]">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

// Routes that hide the global Navbar + Footer (admin has its own layout)
const ADMIN_PREFIX = '/admin';
const TRAINER_PREFIX = '/trainer';

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith(ADMIN_PREFIX) || location.pathname.startsWith(TRAINER_PREFIX);
  const isMemberRoute = !isAdminRoute && user?.role === 'member';

  return (
    <>
      {/* Global navbar — hidden on admin/trainer panel */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* Public */}
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
        <Route path="/login"              element={<LoginPage />} />

        {/* Settings — all authenticated roles */}
        <Route path="/settings"           element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Member */}
        <Route path="/dashboard"          element={<ProtectedRoute roles={['member']}><MemberDashboard /></ProtectedRoute>} />
        <Route path="/notifications"      element={<ProtectedRoute><MyNotifications /></ProtectedRoute>} />
        <Route path="/my-orders"          element={<ProtectedRoute roles={['member']}><MyOrders /></ProtectedRoute>} />
        <Route path="/my-progress"        element={<ProtectedRoute roles={['member']}><MyProgress /></ProtectedRoute>} />
        <Route path="/my-workout"         element={<ProtectedRoute roles={['member']}><MyWorkoutSplit /></ProtectedRoute>} />
        <Route path="/my-exercises"       element={<ProtectedRoute roles={['member']}><MyExercises /></ProtectedRoute>} />
        <Route path="/my-diet"            element={<ProtectedRoute roles={['member']}><MyDiet /></ProtectedRoute>} />

        {/* Trainer */}
        <Route path="/trainer"            element={<ProtectedRoute roles={['trainer']}><TrainerDashboard /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin"              element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/members"      element={<ProtectedRoute roles={['admin']}><AdminMembers /></ProtectedRoute>} />
        <Route path="/admin/exercises"    element={<ProtectedRoute roles={['admin','trainer']}><AdminExercises /></ProtectedRoute>} />
        <Route path="/admin/diet"         element={<ProtectedRoute roles={['admin','trainer']}><AdminDiet /></ProtectedRoute>} />
        <Route path="/admin/store"        element={<ProtectedRoute roles={['admin']}><AdminStore /></ProtectedRoute>} />
        <Route path="/admin/transformations" element={<ProtectedRoute roles={['admin','trainer']}><AdminTransformations /></ProtectedRoute>} />
        <Route path="/admin/enquiries"    element={<ProtectedRoute roles={['admin']}><AdminEnquiries /></ProtectedRoute>} />
        <Route path="/admin/orders"       element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/trainers"     element={<ProtectedRoute roles={['admin']}><AdminTrainers /></ProtectedRoute>} />
        <Route path="/admin/analytics"    element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/revenue"      element={<ProtectedRoute roles={['admin']}><AdminRevenue /></ProtectedRoute>} />
        <Route path="/admin/plans"        element={<ProtectedRoute roles={['admin']}><AdminPlans /></ProtectedRoute>} />
        <Route path="/admin/splits"       element={<ProtectedRoute roles={['admin','trainer']}><AdminSplits /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute roles={['admin']}><AdminNotifications /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Global footer — hidden on admin/trainer panel */}
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
