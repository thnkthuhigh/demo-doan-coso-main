import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const TrainerHome = ({ setActiveModule }) => {
  const [stats, setStats] = useState(null);
  const [recentClasses, setRecentClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchTrainerStats();
  }, []);

  const fetchTrainerStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);

      // Fetch trainer's classes
      const classesRes = await axios.get(
        `http://localhost:5000/api/classes/instructor/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const classes = classesRes.data;

      // Calculate stats
      const totalClasses = classes.length;
      const activeClasses = classes.filter(
        (c) => c.status === "upcoming" || c.status === "ongoing"
      ).length;
      const totalStudents = classes.reduce(
        (sum, c) => sum + (c.currentMembers || 0),
        0
      );

      setStats({
        totalClasses,
        activeClasses,
        totalStudents,
        completedClasses: classes.filter((c) => c.status === "completed").length,
      });

      // Get recent classes (upcoming or ongoing)
      const recent = classes
        .filter((c) => c.status === "upcoming" || c.status === "ongoing")
        .slice(0, 5);
      setRecentClasses(recent);
    } catch (error) {
      console.error("Error fetching trainer stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Tổng Lớp Học",
      value: stats?.totalClasses || 0,
      icon: Dumbbell,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      title: "Lớp Đang Hoạt Động",
      value: stats?.activeClasses || 0,
      icon: TrendingUp,
      color: "green",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      title: "Tổng Học Viên",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      title: "Lớp Đã Hoàn Thành",
      value: stats?.completedClasses || 0,
      icon: CheckCircle,
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Chào mừng, {user?.fullName || user?.name}! 👋
            </h1>
            <p className="text-white/90 text-lg">
              Hãy cùng truyền cảm hứng cho học viên của bạn hôm nay
            </p>
          </div>
          <Dumbbell className="h-16 w-16 text-white/30" />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg p-6 border border-${stat.color}-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className={`text-3xl font-bold text-${stat.color}-700 mb-1`}>
              {stat.value}
            </div>
            <div className={`text-sm font-semibold text-${stat.color}-600`}>
              {stat.title}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Classes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Lớp Học Sắp Tới
          </h2>
          <button
            onClick={() => setActiveModule("classes")}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {recentClasses.length > 0 ? (
          <div className="space-y-4">
            {recentClasses.map((classItem) => (
              <div
                key={classItem._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {classItem.className}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {classItem.currentMembers}/{classItem.maxMembers}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(classItem.startDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    classItem.status === "ongoing"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {classItem.status === "ongoing" ? "Đang diễn ra" : "Sắp diễn ra"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Dumbbell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Chưa có lớp học nào</p>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Quản Lý Lớp Học",
            description: "Xem và quản lý các lớp của bạn",
            icon: Dumbbell,
            color: "indigo",
            module: "classes",
          },
          {
            title: "Điểm Danh",
            description: "Điểm danh học viên",
            icon: CheckCircle,
            color: "green",
            module: "attendance",
          },
          {
            title: "Lịch Giảng Dạy",
            description: "Xem lịch dạy của bạn",
            icon: Calendar,
            color: "purple",
            module: "schedule",
          },
        ].map((action, index) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            onClick={() => setActiveModule(action.module)}
            className={`bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 rounded-2xl p-6 text-left hover:shadow-xl transition-all duration-300 border-2 border-${action.color}-200`}
          >
            <action.icon className={`h-10 w-10 text-${action.color}-600 mb-4`} />
            <h3 className={`text-lg font-bold text-${action.color}-800 mb-2`}>
              {action.title}
            </h3>
            <p className={`text-sm text-${action.color}-600`}>
              {action.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TrainerHome;
