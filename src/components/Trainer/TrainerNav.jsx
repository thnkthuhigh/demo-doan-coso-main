import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Dumbbell,
  Clock,
  CheckSquare,
  Bell,
  User,
} from "lucide-react";
import { toast } from "react-toastify";

const TrainerNav = ({ activeModule, setActiveModule }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Tổng Quan",
      icon: BarChart3,
      description: "Thống kê chung",
    },
    {
      id: "classes",
      label: "Lớp Học Của Tôi",
      icon: Dumbbell,
      description: "Quản lý lớp học",
    },
    {
      id: "schedule",
      label: "Lịch Giảng Dạy",
      icon: Calendar,
      description: "Xem lịch dạy",
    },
    {
      id: "attendance",
      label: "Điểm Danh",
      icon: CheckSquare,
      description: "Điểm danh học viên",
    },
    {
      id: "students",
      label: "Học Viên",
      icon: Users,
      description: "Danh sách học viên",
    },
    {
      id: "statistics",
      label: "Thống Kê",
      icon: BarChart3,
      description: "Xem chi tiết",
    },
    {
      id: "notifications",
      label: "Thông Báo",
      icon: Bell,
      description: "Xem thông báo",
    },
    {
      id: "profile",
      label: "Hồ Sơ",
      icon: User,
      description: "Thông tin cá nhân",
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl transition-all duration-300 z-50 ${
          isCollapsed ? "w-20" : "w-80"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Huấn Luyện Viên</h1>
                    <p className="text-sm text-white/80">Trainer Portal</p>
                  </div>
                </div>
                {user && (
                  <div className="mt-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <p className="text-sm font-semibold truncate">
                      {user.fullName || user.name}
                    </p>
                    <p className="text-xs text-white/70 truncate">{user.email}</p>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
            >
              {isCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-280px)]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeModule === item.id
                  ? "bg-white text-indigo-600 shadow-lg transform scale-105"
                  : "hover:bg-white/10 text-white"
              }`}
            >
              <item.icon
                className={`h-5 w-5 flex-shrink-0 ${
                  activeModule === item.id ? "text-indigo-600" : "text-white"
                }`}
              />
              {!isCollapsed && (
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm">{item.label}</div>
                  {activeModule !== item.id && (
                    <div className="text-xs opacity-70">{item.description}</div>
                  )}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 bg-gradient-to-t from-black/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/90 hover:bg-red-600 rounded-xl transition-all duration-200 shadow-lg"
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="font-semibold">Đăng Xuất</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default TrainerNav;
