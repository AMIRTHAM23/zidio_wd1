// src/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import ExcelAnalysis from "./pages/ExcelAnalysis";

function AppLayout({ children }) {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      {children}
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppLayout>
        <Navigate to="/login" />
      </AppLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <AppLayout>
        <Login />
      </AppLayout>
    ),
  },
  {
    path: "/register",
    element: (
      <AppLayout>
        <Register />
      </AppLayout>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    ),
  },
  {
    path: "/analytics/:fileId",
    element: (
      <AppLayout>
        <Analytics />
      </AppLayout>
    ),
  },
  {
    path: "/profile",
    element: (
      <AppLayout>
        <Profile />
      </AppLayout>
    ),
  },
  {
    path: "/admin",
    element: (
      <AppLayout>
        <AdminPanel />
      </AppLayout>
    ),
  },
  {
    path: "/analysis",
    element: (
      <AppLayout>
        <ExcelAnalysis />
      </AppLayout>
    ),
  },
  {
    path: "/excel",
    element: (
      <AppLayout>
        <ExcelAnalysis />
      </AppLayout>
    ),
  },
]);

export default router;
