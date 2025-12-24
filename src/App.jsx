import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import Login from "./components/Login/index";
import SignUp from "./components/SignUp";
import HomePage from "./components/Home";
import JapaneseNav from "./components/Global/Nav";
import JapaneseFooter from "./components/Global/Fot";
import Club from "./components/Club/index";
import ServicePage from "./components/Services/ServicePage";
import ServiceDetail from "./components/Services/ServiceDetail";
import PaymentPage from "./components/Pay/index";
import BillPage from "./components/Pay/bill";
import AdminClubManager from "./components/Admin/qlclb";
import AdminServiceManager from "./components/Admin/qldv";
import UserProfile from "./components/Users";
import MembershipPage from "./components/Membership";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./components/Admin/Dashboard";
import TrainerLayout from "./components/Trainer/TrainerLayout";
import TrainerDashboard from "./components/Trainer/TrainerDashboard";
import ViewClasses from "./components/Classes/index";
import UserClasses from "./components/Classes/UserClasses";
import ClassDetails from "./components/Classes/ClassDetails";
import StudentAttendance from "./components/Student/StudentAttendance";
import ScrollToTop from "./components/common/ScrollToTop";

// Import Japanese theme thay vì vintage
import "./styles/japanese-global.css";

// Japanese Loading Component
const JapaneseLoading = () => (
  <div className="min-h-screen flex items-center justify-center jp-bg-subtle">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-6">
        {/* Zen Circle Loading với Japanese aesthetic */}
        <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-3 border-t-red-400 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-2 border-gray-300 rounded-full"></div>
        <div className="absolute inset-4 jp-bg-sakura rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">禅</span>
        </div>
      </div>
      <p className="jp-body jp-text-secondary font-medium">Đang tải...</p>
      <p className="jp-caption jp-text-muted mt-1">Loading...</p>
    </div>
  </div>
);

// Main App với Japanese layout
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safely access localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("App loaded with user:", parsedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <JapaneseLoading />;
  }

  return (
    <div className="min-h-screen jp-bg-paper font-japanese">
      <Router>
        <ScrollToTop />
        <AppContent user={user} setUser={setUser} />
      </Router>
    </div>
  );
}

// Component riêng để xử lý location
function AppContent({ user, setUser }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isAdminPage = location.pathname.startsWith("/admin");
  const isTrainerPage = location.pathname.startsWith("/trainer");

  return (
    <div className="app-container flex flex-col min-h-screen relative">
      {/* Zen top border - chỉ hiện khi không phải Login */}
      {!isLoginPage && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent z-50"></div>
      )}

      {/* Navigation với Japanese style - Ẩn trên trang Login, Admin và Trainer */}
      {!isLoginPage && !isAdminPage && !isTrainerPage && <JapaneseNav user={user} setUser={setUser} />}

      {/* Main Content - BỎ padding-top */}
      <main className="flex-1 relative">
        {/* Zen divider line - chỉ hiện khi không phải Login */}
        {!isLoginPage && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        )}

        <Routes>
          {/* Main routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/club" element={<Club />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/services/detail/:id" element={<ServiceDetail />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/bill" element={<BillPage />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/classes" element={<ViewClasses />} />
          <Route path="/my-classes" element={<UserClasses />} />
          <Route path="/classes/:id/details" element={<ClassDetails />} />
          <Route path="/attendance" element={<StudentAttendance />} />

          {/* Admin routes với Japanese styling */}
          <Route
            path="/admin/*"
            element={
              <div className="jp-bg-subtle min-h-screen">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </div>
            }
          />

          {/* Trainer routes */}
          <Route
            path="/trainer/*"
            element={
              <div className="min-h-screen bg-gray-50">
                <TrainerLayout>
                  <TrainerDashboard />
                </TrainerLayout>
              </div>
            }
          />

          {/* Legacy admin routes */}
          <Route path="/qlclb" element={<AdminClubManager />} />
          <Route path="/qldv" element={<AdminServiceManager />} />

          {/* Default admin route */}
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

          {/* 404 Route với Japanese style */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center jp-bg-subtle">
                <div className="text-center">
                  <div className="text-9xl jp-text-sakura mb-4 font-light">
                    404
                  </div>
                  <h1 className="jp-heading-2 jp-text-primary mb-4">
                    Không tìm thấy trang
                  </h1>
                  <p className="jp-body jp-text-secondary mb-8">
                    Trang bạn tìm kiếm không tồn tại
                  </p>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="jp-btn jp-btn-sakura"
                  >
                    Về trang chủ
                  </button>
                </div>
              </div>
            }
          />
        </Routes>

        {/* Bottom zen divider - chỉ hiện khi không phải Login */}
        {!isLoginPage && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        )}
      </main>

      {/* Footer với Japanese style - Ẩn trên trang Login, Admin và Trainer */}
      {!isLoginPage && !isAdminPage && !isTrainerPage && <JapaneseFooter />}

      {/* Bottom border - chỉ hiện khi không phải Login */}
      {!isLoginPage && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
      )}
    </div>
  );
}

export default App;
