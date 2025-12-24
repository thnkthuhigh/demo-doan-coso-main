import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  CreditCard,
  Calendar,
  Dumbbell,
  Building,
  TrendingUp,
  ImageIcon,
  ClipboardList,
} from "lucide-react";
import AdminNav from "../AdminNav";
import ImageManager from "../ImageManager";
import PaymentManagement from "../PaymentManagement";
import MembershipManagement from "../MembershipManagement";
import AdminServiceManager from "../qldv";
import AdminClubManager from "../qlclb";
import ClassManagement from "../ClassManagement";
import AttendanceManagement from "../AttendanceManagement";
import Statistics from "../Statistics";
import UserManagement from "../UserManagement";
import GymLocationManagement from "../GymLocationManagement";
import ChatSupportManagement from "../ChatSupportManagement";
import ActiveChats from "../ActiveChats";

const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Debug log
  console.log("🎯 Active Module:", activeModule);
  console.log("📐 Sidebar Collapsed:", isCollapsed);

  // Render content based on active module
  const renderContent = () => {
    console.log("🔄 Rendering content for:", activeModule);
    switch (activeModule) {
      case "users":
        return <UserManagement />;
      case "images":
        return <ImageManager />;
      case "payments":
        return <PaymentManagement />;
      case "memberships":
        return <MembershipManagement />;
      case "services":
        return <AdminServiceManager />;
      case "clubs":
        return <AdminClubManager />;
      case "classes":
        return <ClassManagement />;
      case "attendance":
        return <AttendanceManagement />;
      case "stats":
        return <Statistics />;
      case "locations":
        return <GymLocationManagement />;
      case "chat":
        return <ChatSupportManagement />;
      case "dashboard":
      default:
        return <DashboardHome setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav 
        activeModule={activeModule} 
        setActiveModule={setActiveModule}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main content area - margin adjusts based on sidebar state */}
      <main 
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '80px' : '320px' }}
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

// Dashboard home with enhanced styling
const DashboardHome = ({ setActiveModule }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/stats/dashboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-amber-200/30 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 drop-shadow-md">
              Admin Dashboard
            </h1>
            <p className="text-blue-100 text-lg">
              Chào mừng bạn đến với bảng điều khiển quản trị Royal Fitness
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>

      {/* Stat cards với layout hiện đại */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Tổng người dùng"
          value={stats?.stats?.totalUsers || 0}
          change={`+${stats?.stats?.newUsersThisMonth || 0} tháng này`}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          trend="up"
        />
        <StatCard
          title="Doanh thu tháng"
          value={formatCurrency(stats?.stats?.monthlyRevenue || 0)}
          change={`${stats?.stats?.attendanceRate || 0}% tỷ lệ tham gia`}
          icon={<CreditCard className="h-6 w-6" />}
          color="green"
          trend="up"
        />
        <StatCard
          title="Lớp học hoạt động"
          value={stats?.stats?.activeClasses || 0}
          change={`${stats?.stats?.newMembersThisMonth || 0} đăng ký mới`}
          icon={<Calendar className="h-6 w-6" />}
          color="purple"
          trend="stable"
        />
        <StatCard
          title="Thành viên mới"
          value={stats?.stats?.newMembersThisMonth || 0}
          change="Tháng này"
          icon={<Users className="h-6 w-6" />}
          color="orange"
          trend="up"
        />
      </div>

      {/* Charts Section */}
      {stats?.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Enrollment Chart */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Đăng ký 7 ngày qua
            </h3>
            <div className="space-y-3">
              {stats.charts.last7Days.map((day, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-20 text-xs text-gray-500 font-medium">
                    {new Date(day.date).toLocaleDateString("vi-VN", {month: 'short', day: 'numeric'})}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            (day.enrollments /
                              Math.max(
                                ...stats.charts.last7Days.map(
                                  (d) => d.enrollments
                                )
                              )) *
                              100,
                            5
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-10 text-sm font-semibold text-gray-700 text-right">
                    {day.enrollments}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Services */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              Dịch vụ phổ biến
            </h3>
            <div className="space-y-3">
              {stats.charts.popularServices.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        index === 0
                          ? "bg-blue-500"
                          : index === 1
                          ? "bg-green-500"
                          : index === 2
                          ? "bg-orange-500"
                          : index === 3
                          ? "bg-purple-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {service._id}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    {service.count} lượt
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Truy cập nhanh
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <QuickAction
            title="Quản lý lớp học"
            icon={<Calendar className="h-6 w-6" />}
            onClick={() => setActiveModule("classes")}
            color="purple"
          />
          <QuickAction
            title="Điểm danh"
            icon={<ClipboardList className="h-6 w-6" />}
            onClick={() => setActiveModule("attendance")}
            color="blue"
          />
          <QuickAction
            title="Thanh toán"
            icon={<CreditCard className="h-6 w-6" />}
            onClick={() => setActiveModule("payments")}
            color="green"
          />
          <QuickAction
            title="Thành viên"
            icon={<Users className="h-6 w-6" />}
            onClick={() => setActiveModule("users")}
            color="indigo"
          />
          <QuickAction
            title="Dịch vụ"
            icon={<Dumbbell className="h-6 w-6" />}
            onClick={() => setActiveModule("services")}
            color="pink"
          />
          <QuickAction
            title="CLB"
            icon={<Building className="h-6 w-6" />}
            onClick={() => setActiveModule("clubs")}
            color="orange"
          />
          <QuickAction
            title="Hình ảnh"
            icon={<ImageIcon className="h-6 w-6" />}
            onClick={() => setActiveModule("images")}
            color="blue"
          />
          <QuickAction
            title="Thống kê"
            icon={<TrendingUp className="h-6 w-6" />}
            onClick={() => setActiveModule("stats")}
            color="indigo"
          />
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            Hoạt động gần đây
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {stats?.recentActivities?.enrollments
            ?.slice(0, 5)
            .map((enrollment, index) => (
              <ActivityItem
                key={index}
                title={`${enrollment.user?.username} đăng ký lớp ${enrollment.class?.className}`}
                time={new Date(enrollment.enrollmentDate).toLocaleDateString(
                  "vi-VN"
                )}
                icon={<Users className="h-5 w-5" />}
                color="blue"
              />
            ))}
          {stats?.recentActivities?.classes
            ?.slice(0, 3)
            .map((classItem, index) => (
              <ActivityItem
                key={`class-${index}`}
                title={`Lớp ${classItem.className} (${classItem.serviceName}) đã được tạo`}
                time={new Date(classItem.createdAt).toLocaleDateString("vi-VN")}
                icon={<Calendar className="h-5 w-5" />}
                color="purple"
              />
            ))}
        </div>
      </div>
    </div>
  );
};

// Modern Stat Card Component
const StatCard = ({ title, value, change, icon, color, trend }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    indigo: "bg-indigo-500",
  };

  const trendIcons = {
    up: "↗",
    down: "↘",
    stable: "→",
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-5 hover:shadow-xl transition-shadow border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-lg ${colorClasses[color]} shadow-sm`}
        >
          <div className="text-white">{icon}</div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            trend === "up"
              ? "text-green-700 bg-green-50"
              : trend === "down"
              ? "text-red-700 bg-red-50"
              : "text-orange-700 bg-orange-50"
          }`}
        >
          {trendIcons[trend]}
        </span>
      </div>
      <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-800">
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-2">{change}</p>
    </div>
  );
};

// Modern Quick Action Component
const QuickAction = ({ title, icon, onClick, color }) => {
  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    purple: "bg-purple-500 hover:bg-purple-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    pink: "bg-pink-500 hover:bg-pink-600",
    indigo: "bg-indigo-500 hover:bg-indigo-600",
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${colorClasses[color]} text-white shadow-sm hover:shadow-md`}
    >
      <div className="mb-2">
        {icon}
      </div>
      <span className="text-xs font-semibold text-center">
        {title}
      </span>
    </button>
  );
};

// Modern Activity Item Component
const ActivityItem = ({ title, time, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    indigo: "bg-indigo-500",
  };

  return (
    <div className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors">
      <div
        className={`p-2.5 rounded-lg mr-4 ${colorClasses[color]} shadow-sm`}
      >
        <div className="text-white">{icon}</div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800 mb-0.5">
          {title}
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
