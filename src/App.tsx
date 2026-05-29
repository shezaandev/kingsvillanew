import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./admin/AuthContext";
import ProtectedRoute from "./admin/ProtectedRoute";
import VillaWebsite from "./components/VillaWebsite";
import AdminLogin from "./admin/AdminLogin";
import AdminPanel from "./admin/AdminPanel";

// Import admin console sub-modules
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminPricing from "./admin/pages/AdminPricing";
import AdminGallery from "./admin/pages/AdminGallery";
import AdminReviews from "./admin/pages/AdminReviews";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminBilling from "./admin/pages/AdminBilling";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Main Luxury Website View */}
          <Route path="/" element={<VillaWebsite />} />

          {/* Secure Admin Portal Credentials View */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Active Sessions console */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          >
            {/* Console Subroutes rendered dynamically inside Sidebar panel shell */}
            <Route index element={<AdminDashboard />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="billing" element={<AdminBilling />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Capture undefined paths gracefully */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
