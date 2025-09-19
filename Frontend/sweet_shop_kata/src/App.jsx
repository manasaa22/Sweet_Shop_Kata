import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Helper: get token & role (you may enhance this later)
const getToken = () => localStorage.getItem("token");
const getRole = () => localStorage.getItem("role"); // set this after login

function PrivateRoute({ children, role }) {
  const token = getToken();
  const userRole = getRole();

  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/dashboard" replace />;

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Customer dashboard (default after login) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />

        {/* Admin dashboard (only for admin role) */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Redirect root → login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
