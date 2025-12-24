import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart,
  TrendingUp,
  Users,
  Clock,
  Award,
  Target,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";

const TrainerStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // week, month, year

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
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

      // Calculate statistics
      const totalClasses = classes.length;
      const activeClasses = classes.filter(
        (c) => c.status === "upcoming" || c.status === "ongoing"
      ).length;
      const completedClasses = classes.filter(
        (c) => c.status === "completed"
      ).length;
      const totalStudents = classes.reduce(
        (sum, c) => sum + (c.currentMembers || 0),
        0
      );
      const totalSessions = classes.reduce(
        (sum, c) => sum + (c.totalSessions || 0),
        0
      );
      const avgStudentsPerClass =
        totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

      // Calculate attendance rate (mock data - should come from backend)
      const attendanceRate = 85; // %

      // Calculate earnings (mock data - should come from backend)
      const totalEarnings = classes.reduce(
        (sum, c) => sum + (c.price || 0) * (c.currentMembers || 0),
        0
      );

      setStats({
        totalClasses,
        activeClasses,
        completedClasses,
        totalStudents,
        totalSessions,
        avgStudentsPerClass,
        attendanceRate,
        totalEarnings,
        monthlyClasses: [12, 15, 18, 20, 22, 25], // Mock data for chart
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Tổng Lớp Học",
      value: stats?.totalClasses || 0,
      icon: BarChart,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "Lớp Đang Hoạt Động",
      value: stats?.activeClasses || 0,
      icon: TrendingUp,
      color: "green",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: "Tổng Học Viên",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      change: "+15%",
      changeType: "increase",
    },
    {
      title: "Tỷ Lệ Điểm Danh",
      value: `${stats?.attendanceRate || 0}%`,
      icon: Target,
      color: "orange",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      change: "+5%",
      changeType: "increase",
    },
    {
      title: "TB Học Viên/Lớp",
      value: stats?.avgStudentsPerClass || 0,
      icon: Award,
      color: "indigo",
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
      change: "+3",
      changeType: "increase",
    },
    {
      title: "Tổng Buổi Học",
      value: stats?.totalSessions || 0,
      icon: Clock,
      color: "pink",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
      change: "+25",
      changeType: "increase",
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-xl shadow-lg">
            <TrendingUp className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              📊 Thống Kê Chi Tiết
            </h1>
            <p className="text-gray-600 mt-1">
              Xem hiệu suất giảng dạy của bạn
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === range
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {range === "week"
                ? "Tuần"
                : range === "month"
                ? "Tháng"
                : "Năm"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg p-6 border-2 border-${stat.color}-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div
                className={`flex items-center text-xs font-semibold ${
                  stat.changeType === "increase"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <TrendingUp
                  className={`h-4 w-4 mr-1 ${
                    stat.changeType === "increase" ? "" : "rotate-180"
                  }`}
                />
                {stat.change}
              </div>
            </div>
            <div className={`text-4xl font-bold text-${stat.color}-700 mb-1`}>
              {stat.value}
            </div>
            <div className={`text-sm font-semibold text-${stat.color}-600`}>
              {stat.title}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Xu Hướng Lớp Học
        </h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {stats?.monthlyClasses.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${(value / Math.max(...stats.monthlyClasses)) * 100}%`,
                }}
              ></div>
              <span className="text-xs text-gray-600 mt-2">
                T{index + 1}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-semibold mb-1">
                Hoàn Thành
              </p>
              <p className="text-3xl font-bold text-green-700">
                {stats?.completedClasses || 0}
              </p>
              <p className="text-xs text-green-600">Lớp đã hoàn thành</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-semibold mb-1">
                Doanh Thu Ước Tính
              </p>
              <p className="text-3xl font-bold text-purple-700">
                {(stats?.totalEarnings || 0).toLocaleString("vi-VN")}đ
              </p>
              <p className="text-xs text-purple-600">Từ các lớp học</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          💡 Gợi Ý Cải Thiện
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              Tỷ lệ điểm danh của bạn đang ở mức tốt ({stats?.attendanceRate}%). 
              Hãy tiếp tục khuyến khích học viên tham gia đầy đủ.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              Số lượng học viên trung bình là {stats?.avgStudentsPerClass} người/lớp. 
              Có thể tăng chất lượng giảng dạy để thu hút thêm học viên.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>
              Bạn đã hoàn thành {stats?.completedClasses} lớp học. 
              Tiếp tục duy trì động lực giảng dạy!
            </span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default TrainerStatistics;
