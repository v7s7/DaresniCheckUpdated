import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "./hooks/useAuth.jsx";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import Search from "./pages/Search";
import TutorProfile from "./pages/TutorProfile";
import BookingFlow from "./pages/BookingFlow";
import StudentDashboard from "./pages/StudentDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/not-found";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, userProfile, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!isAuthenticated) return <Redirect to="/login" />;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.role)) {
    return <Redirect to="/" />;
  }
  
  return children;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/tutor/:id" component={TutorProfile} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      {/* Protected routes */}
      <Route path="/book/:tutorId">
        <ProtectedRoute allowedRoles={['student']}>
          <BookingFlow />
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardRouter />
        </ProtectedRoute>
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function DashboardRouter() {
  const { userProfile } = useAuth();
  
  if (userProfile?.role === 'student') {
    return <StudentDashboard />;
  } else if (userProfile?.role === 'tutor') {
    return <TutorDashboard />;
  } else {
    return <Redirect to="/" />;
  }
}

function App() {
  const { loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Layout>
        <Router />
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
