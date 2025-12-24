import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TrainerLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is trainer
    const checkTrainerAuth = () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("⚠️ No token found, redirecting to login");
          toast.error("Vui lòng đăng nhập để tiếp tục");
          navigate("/login");
          return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        console.log("👤 Current user:", user);
        
        if (!user || user.role !== "trainer") {
          console.warn("⚠️ User is not trainer, redirecting home");
          toast.error("Bạn không có quyền truy cập trang này");
          navigate("/");
        } else {
          console.log("✅ Trainer authenticated successfully");
        }
      } catch (error) {
        console.error("❌ Auth error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Phiên đăng nhập không hợp lệ");
        navigate("/login");
      }
    };

    checkTrainerAuth();
  }, [navigate]);

  return <div className="min-h-screen bg-gray-100">{children}</div>;
};

export default TrainerLayout;
