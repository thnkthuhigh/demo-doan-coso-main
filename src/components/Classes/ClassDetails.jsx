import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  User,
  ArrowLeft,
  CheckCircle,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Star,
  Play,
  Shield,
  Crown,
  Sparkles,
  Heart,
  Trophy,
  Timer,
  Zap,
  Cherry,
  Mountain,
  Waves,
  Flower2,
  Leaf,
  Sun,
  Moon,
  AlertCircle,
  ChevronRight,
  Globe,
  Activity,
  Flame,
  Eye,
  Gift,
  Gem,
  Bolt,
  MessageCircle,
  Phone,
  Mail,
  Share2,
  Bookmark,
  Download,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  normalizeClassData,
  normalizeAttendanceArray,
} from "../../utils/classDataNormalizer";

export default function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser._id) {
        checkEnrollmentStatus(parsedUser._id);
      }
    }
    fetchClassDetails();
  }, [id]);

  const checkEnrollmentStatus = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5000/api/classes/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const enrolled = response.data.some(
        (enrollment) => enrollment.class?._id === id
      );
      setIsEnrolled(enrolled);

      if (enrolled) {
        fetchAttendanceHistory(userId);
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  };

  const fetchAttendanceHistory = async (userId) => {
    try {
      setLoadingAttendance(true);
      const token = localStorage.getItem("token");
      
      // ✅ Sử dụng API mới giống Mobile: /api/attendance/my-history/:classId
      const response = await axios.get(
        `http://localhost:5000/api/attendance/my-history/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Normalize attendance data
      const normalizedData = normalizeAttendanceArray(response.data);
      setAttendanceHistory(normalizedData || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceHistory([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Generate detailed schedule dates
  const generateScheduleDates = () => {
    if (!classData?.schedule || !classData?.startDate || !classData?.endDate) {
      return [];
    }

    const dates = [];
    const start = new Date(classData.startDate);
    const end = new Date(classData.endDate);
    const scheduleDays = classData.schedule.map(s => s.dayOfWeek);

    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (scheduleDays.includes(dayOfWeek)) {
        const scheduleInfo = classData.schedule.find(s => s.dayOfWeek === dayOfWeek);
        dates.push({
          date: new Date(currentDate),
          dayOfWeek,
          startTime: scheduleInfo?.startTime,
          endTime: scheduleInfo?.endTime,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/classes/${id}/details`
      );
      
      // ✅ Normalize class data
      const normalizedClass = normalizeClassData(response.data);
      setClassData(normalizedClass);
    } catch (error) {
      console.error("Error fetching class details:", error);
      toast.error("Không thể tải thông tin lớp học");
      navigate("/classes");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng ký lớp học");
      navigate("/login");
      return;
    }

    try {
      setEnrolling(true);
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/classes/enroll",
        { classId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Đăng ký lớp học thành công! Chuyển đến giỏ hàng...");
      
      // Navigate to cart/payment page after brief delay
      setTimeout(() => {
        navigate("/payment");
      }, 1500);
    } catch (error) {
      console.error("Error enrolling:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể đăng ký lớp học";
      toast.error(errorMessage);
    } finally {
      setEnrolling(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "upcoming":
        return {
          text: "Sắp Diễn Ra",
          bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          icon: Calendar,
        };
      case "ongoing":
        return {
          text: "Đang Diễn Ra",
          bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          icon: Activity,
        };
      case "completed":
        return {
          text: "Hoàn Thành",
          bgColor: "bg-gradient-to-r from-purple-50 to-violet-50",
          textColor: "text-purple-700",
          borderColor: "border-purple-200",
          icon: Trophy,
        };
      case "cancelled":
        return {
          text: "Đã Hủy",
          bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          icon: AlertCircle,
        };
      default:
        return {
          text: "Không Xác Định",
          bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          icon: Target,
        };
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return "Chưa Có Lịch Học";

    const daysOfWeek = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    return schedule
      .map((slot) => {
        const day = daysOfWeek[slot.dayOfWeek] || "Không Xác Định";
        return `${day}: ${slot.startTime || "Không Có"}-${
          slot.endTime || "Không Có"
        }`;
      })
      .join(", ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Enhanced Loading Animation */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-20"
          >
            <Cherry className="h-16 w-16 text-pink-200 opacity-40" />
          </motion.div>
          <motion.div
            animate={{ y: [-20, 20, -20], rotate: [0, 180, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-32"
          >
            <Mountain className="h-20 w-20 text-indigo-200 opacity-30" />
          </motion.div>
          <motion.div
            animate={{ x: [-30, 30, -30], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-40 left-1/3"
          >
            <Waves className="h-14 w-14 text-cyan-200 opacity-35" />
          </motion.div>
        </div>

        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center bg-white/95 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border border-gray-200/50 max-w-lg"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <BookOpen className="h-12 w-12 text-purple-600" />
                </motion.div>
              </div>
            </div>

            <div className="text-4xl font-light text-gray-800 mb-4 font-serif tracking-wide">
              クラス詳細
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Đang Tải Chi Tiết Lớp Học
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Vui lòng đợi trong giây lát...
            </p>

            <div className="flex justify-center space-x-3">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                ></motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border border-gray-200/50">
              <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <BookOpen className="h-20 w-20 text-gray-400" />
              </div>

              <div className="text-4xl font-light text-gray-800 mb-4 font-serif">
                クラスが見つかりません
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Không Tìm Thấy Lớp Học
              </h2>
              <p className="text-gray-600 mb-8 text-xl max-w-2xl mx-auto">
                Lớp học bạn đang tìm kiếm có thể đã được cập nhật hoặc không còn
                khả dụng.
              </p>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/classes")}
                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
              >
                <ArrowLeft className="h-6 w-6 mr-3" />
                Quay Lại Danh Sách Lớp Học
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(classData.status);
  const StatusIcon = statusInfo.icon;
  const canEnroll =
    (classData.status === "upcoming" || classData.status === "ongoing") &&
    classData.currentMembers < classData.maxMembers;
  const progressPercent =
    classData.totalSessions > 0
      ? ((classData.currentSession || 0) / classData.totalSessions) * 100
      : 0;

  const tabs = isEnrolled ? [
    { id: "overview", label: "Tổng Quan", icon: Eye },
    { id: "schedule", label: "Lịch Học", icon: Calendar },
    { id: "attendance", label: "Điểm Danh", icon: CheckCircle },
    { id: "benefits", label: "Lợi Ích", icon: Gift },
    { id: "requirements", label: "Yêu Cầu", icon: Shield },
  ] : [
    { id: "overview", label: "Tổng Quan", icon: Eye },
    { id: "schedule", label: "Lịch Học", icon: Calendar },
    { id: "benefits", label: "Lợi Ích", icon: Gift },
    { id: "requirements", label: "Yêu Cầu", icon: Shield },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden"
    >
      {/* Enhanced Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            y: [0, -50, 0],
            rotate: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20"
        >
          <Cherry className="h-24 w-24 text-pink-200 opacity-30" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -25, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute top-32 right-16"
        >
          <Mountain className="h-28 w-28 text-indigo-200 opacity-25" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
          className="absolute bottom-32 left-1/4"
        >
          <Waves className="h-20 w-20 text-cyan-200 opacity-40" />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 right-12"
        >
          <Flower2 className="h-18 w-18 text-rose-200 opacity-35" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -15, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-20 right-1/4"
        >
          <Leaf className="h-16 w-16 text-green-200 opacity-30" />
        </motion.div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10">
        {/* Enhanced Navigation Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-white/80 backdrop-blur-2xl border-b border-gray-200/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/classes")}
                  className="flex items-center text-purple-600 hover:text-purple-700 transition-colors font-semibold group bg-purple-50 hover:bg-purple-100 px-6 py-3 rounded-2xl border border-purple-200"
                >
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Danh Sách Lớp Học
                </motion.button>
                <ChevronRight className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700 font-bold text-xl truncate max-w-xs md:max-w-none">
                  {classData.className}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Share2 className="h-5 w-5 text-gray-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Bookmark className="h-5 w-5 text-gray-600" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="relative">
                {classData.service?.image && (
                  <div className="absolute inset-0">
                    <img
                      src={classData.service.image}
                      alt={classData.serviceName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-pink-900/80 to-indigo-900/90"></div>
                  </div>
                )}

                <div className="relative z-10 p-8 md:p-12">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-white">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30">
                          <BookOpen className="h-10 w-10 text-white" />
                        </div>
                        <div>
                          <div className="text-xl font-light mb-2 opacity-90 tracking-wide">
                            Lớp học thể dục
                          </div>
                          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            {classData.className}
                          </h1>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="flex items-center bg-white/20 backdrop-blur-md rounded-xl px-6 py-3 border border-white/30">
                          <Star className="h-6 w-6 text-yellow-300 mr-3 fill-current" />
                          <span className="font-semibold text-lg">
                            {classData.serviceName}
                          </span>
                        </div>

                        <div
                          className={`flex items-center px-6 py-3 rounded-xl border-2 ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} bg-white/95 backdrop-blur-md`}
                        >
                          <StatusIcon className="h-6 w-6 mr-3" />
                          <span className="font-bold text-lg">
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>

                      <p className="text-xl opacity-90 max-w-2xl leading-relaxed mb-8">
                        {classData.description ||
                          "Tham gia lớp học tuyệt vời này để nâng cao sức khỏe và thể lực của bạn với đội ngũ huấn luyện viên chuyên nghiệp."}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center px-6 py-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Tải Brochure
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center px-6 py-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300"
                        >
                          <MessageCircle className="h-5 w-5 mr-2" />
                          Hỏi Đáp
                        </motion.button>
                      </div>
                    </div>

                    <div>
                      <div className="grid grid-cols-2 gap-6">
                        {[
                          {
                            icon: Users,
                            value: `${classData.currentMembers || 0}/${
                              classData.maxMembers
                            }`,
                            label: "Học Viên",
                            color: "from-blue-400 to-blue-600",
                          },
                          {
                            icon: Calendar,
                            value: `${classData.totalSessions || 0}`,
                            label: "Tổng Buổi",
                            color: "from-green-400 to-green-600",
                          },
                          {
                            icon: Timer,
                            value: `${classData.currentSession || 0}`,
                            label: "Đã Học",
                            color: "from-orange-400 to-orange-600",
                          },
                          {
                            icon: Trophy,
                            value: `${progressPercent.toFixed(0)}%`,
                            label: "Tiến Độ",
                            color: "from-purple-400 to-purple-600",
                          },
                        ].map((stat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center group hover:bg-white/25 transition-all duration-300"
                          >
                            <div
                              className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                            >
                              <stat.icon className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">
                              {stat.value}
                            </div>
                            <div className="text-sm opacity-80 text-white font-medium">
                              {stat.label}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {classData.status === "ongoing" && (
                        <div className="mt-8 bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-white font-medium">
                              Tiến Độ Lớp Học
                            </span>
                            <span className="text-white font-bold text-lg">
                              {progressPercent.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 2, delay: 0.5 }}
                              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full"
                            ></motion.div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Layout - All Full Width */}
          <div className="space-y-8">
            {/* 1. Enhanced Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col items-center p-4 rounded-xl font-semibold transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      }`}
                    >
                      <tab.icon className="h-6 w-6 mb-2" />
                      <span className="text-sm">{tab.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 2. Tổng Quan Lớp Học - Full Width */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "overview" && (
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mr-4">
                        <Eye className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800">
                        Tổng Quan Lớp Học
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <h4 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-purple-200">
                          Thông Tin Cơ Bản
                        </h4>
                        {[
                          {
                            icon: User,
                            label: "Huấn Luyện Viên",
                            value: classData.instructorName || "Chưa Có",
                            color: "purple",
                          },
                          {
                            icon: MapPin,
                            label: "Địa Điểm",
                            value: classData.location || "Phòng Tập Chính",
                            color: "blue",
                          },
                          {
                            icon: Clock,
                            label: "Thời Gian",
                            value: formatSchedule(classData.schedule),
                            color: "green",
                          },
                          {
                            icon: Calendar,
                            label: "Thời Gian Khóa Học",
                            value: `${new Date(
                              classData.startDate
                            ).toLocaleDateString("vi-VN")} - ${new Date(
                              classData.endDate
                            ).toLocaleDateString("vi-VN")}`,
                            color: "amber",
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-200"
                          >
                            <div
                              className={`w-14 h-14 bg-${item.color}-100 rounded-2xl flex items-center justify-center flex-shrink-0 border border-${item.color}-200`}
                            >
                              <item.icon
                                className={`h-7 w-7 text-${item.color}-600`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-600 font-semibold mb-1">
                                {item.label}
                              </div>
                              <div className="text-gray-800 font-bold text-lg break-words">
                                {item.value}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-200">
                          Thống Kê Lớp Học
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              icon: Users,
                              label: "Tổng Học Viên",
                              value: `${classData.currentMembers || 0}`,
                              max: classData.maxMembers,
                              color: "blue",
                            },
                            {
                              icon: Activity,
                              label: "Buổi Học",
                              value: `${classData.currentSession || 0}`,
                              max: classData.totalSessions,
                              color: "green",
                            },
                            {
                              icon: Trophy,
                              label: "Hoàn Thành",
                              value: `${progressPercent.toFixed(0)}%`,
                              color: "purple",
                            },
                            {
                              icon: Star,
                              label: "Đánh Giá",
                              value: "4.8/5",
                              color: "amber",
                            },
                          ].map((stat, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                              className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border-2 border-${stat.color}-200 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group`}
                            >
                              <stat.icon
                                className={`h-10 w-10 text-${stat.color}-600 mx-auto mb-3 group-hover:scale-110 transition-transform`}
                              />
                              <div
                                className={`text-3xl font-bold text-${stat.color}-800 mb-1`}
                              >
                                {stat.value}
                              </div>
                              {stat.max && (
                                <div className="text-sm text-gray-600 mb-1">
                                  / {stat.max}
                                </div>
                              )}
                              <div
                                className={`text-sm text-${stat.color}-600 font-semibold`}
                              >
                                {stat.label}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200">
                          <h5 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <Info className="h-6 w-6 mr-2 text-blue-600" />
                            Tình Trạng Đăng Ký
                          </h5>
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-3">
                              <span className="font-medium">Đã đăng ký</span>
                              <span className="font-bold">
                                {classData.currentMembers || 0}/
                                {classData.maxMembers}
                              </span>
                            </div>
                            <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${
                                    ((classData.currentMembers || 0) /
                                      classData.maxMembers) *
                                    100
                                  }%`,
                                }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full rounded-full shadow-lg"
                              ></motion.div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Còn lại:{" "}
                            <span className="font-bold text-purple-600 text-lg">
                              {classData.maxMembers -
                                (classData.currentMembers || 0)}{" "}
                              chỗ
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "schedule" && (
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800">
                        Lịch Học Chi Tiết
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center mb-3">
                          <Calendar className="h-6 w-6 text-green-600 mr-3" />
                          <span className="text-sm font-bold text-green-700">
                            Ngày Bắt Đầu
                          </span>
                        </div>
                        <div className="text-green-800 font-bold text-xl">
                          {new Date(classData.startDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-red-50 to-rose-100 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center mb-3">
                          <Calendar className="h-6 w-6 text-red-600 mr-3" />
                          <span className="text-sm font-bold text-red-700">
                            Ngày Kết Thúc
                          </span>
                        </div>
                        <div className="text-red-800 font-bold text-xl">
                          {new Date(classData.endDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-violet-100 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center mb-3">
                          <Timer className="h-6 w-6 text-purple-600 mr-3" />
                          <span className="text-sm font-bold text-purple-700">
                            Tổng Số Buổi
                          </span>
                        </div>
                        <div className="text-purple-800 font-bold text-xl">
                          {generateScheduleDates().length} buổi
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-200">
                        Lịch Trình Các Buổi Học
                      </h4>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-8 mb-6 shadow-lg">
                        <div className="text-blue-800 font-bold text-xl leading-relaxed">
                          {formatSchedule(classData.schedule)}
                        </div>
                      </div>

                      <h4 className="text-xl font-bold text-gray-800 mb-4">
                        Tất Cả Các Ngày Học ({generateScheduleDates().length} buổi)
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                        {generateScheduleDates().map((dateInfo, index) => {
                          const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                          const isPast = dateInfo.date < new Date();
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className={`p-4 rounded-xl border-2 ${
                                isPast 
                                  ? "bg-gray-50 border-gray-200" 
                                  : "bg-blue-50 border-blue-200"
                              } hover:shadow-md transition-all`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                  isPast ? "bg-gray-200 text-gray-600" : "bg-blue-200 text-blue-700"
                                }`}>
                                  {dayNames[dateInfo.dayOfWeek]}
                                </span>
                                {isPast && (
                                  <CheckCircle className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              <div className={`font-bold text-lg mb-1 ${
                                isPast ? "text-gray-600" : "text-gray-800"
                              }`}>
                                {dateInfo.date.toLocaleDateString("vi-VN")}
                              </div>
                              <div className={`text-sm flex items-center ${
                                isPast ? "text-gray-500" : "text-blue-600"
                              }`}>
                                <Clock className="h-3 w-3 mr-1" />
                                {dateInfo.startTime} - {dateInfo.endTime}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "benefits" && (
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mr-4">
                        <Gift className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800">
                        Lợi Ích Từ Lớp Học
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {(
                        classData.service?.benefits || [
                          "Cải thiện sức khỏe tổng thể",
                          "Tăng cường thể lực và sức bền",
                          "Giảm căng thẳng, stress",
                          "Xây dựng thói quen tập luyện",
                          "Kết nối cộng đồng fitness",
                          "Hướng dẫn chuyên nghiệp",
                          "Theo dõi tiến độ cá nhân",
                          "Môi trường tập luyện an toàn",
                        ]
                      ).map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center p-6 bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl hover:shadow-xl transition-all duration-300 group"
                        >
                          <CheckCircle className="h-8 w-8 text-green-600 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-gray-700 font-semibold text-lg">
                            {benefit}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "attendance" && isEnrolled && (
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mr-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800">
                        Lịch Sử Điểm Danh
                      </h3>
                    </div>

                    {loadingAttendance ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                      </div>
                    ) : attendanceHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <AlertCircle className="h-10 w-10 text-gray-400" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-700 mb-2">
                          Chưa Có Dữ Liệu Điểm Danh
                        </h4>
                        <p className="text-gray-500">
                          Lịch sử điểm danh của bạn sẽ hiển thị ở đây sau các buổi học
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center mb-3">
                              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                              <span className="text-sm font-bold text-green-700">
                                Có Mặt
                              </span>
                            </div>
                            <div className="text-green-800 font-bold text-3xl">
                              {attendanceHistory.filter(a => a.status === "present").length}
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-red-50 to-rose-100 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center mb-3">
                              <X className="h-6 w-6 text-red-600 mr-3" />
                              <span className="text-sm font-bold text-red-700">
                                Vắng Mặt
                              </span>
                            </div>
                            <div className="text-red-800 font-bold text-3xl">
                              {attendanceHistory.filter(a => a.status === "absent").length}
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center mb-3">
                              <Activity className="h-6 w-6 text-blue-600 mr-3" />
                              <span className="text-sm font-bold text-blue-700">
                                Tỷ Lệ Tham Gia
                              </span>
                            </div>
                            <div className="text-blue-800 font-bold text-3xl">
                              {attendanceHistory.length > 0 
                                ? ((attendanceHistory.filter(a => a.status === "present").length / attendanceHistory.length) * 100).toFixed(1)
                                : 0}%
                            </div>
                          </div>
                        </div>

                        <h4 className="text-xl font-bold text-gray-800 mb-4">
                          Chi Tiết Các Buổi Học
                        </h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          {attendanceHistory.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record, index) => (
                            <motion.div
                              key={record._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`p-5 rounded-xl border-2 ${
                                record.status === "present"
                                  ? "bg-green-50 border-green-200"
                                  : "bg-red-50 border-red-200"
                              } hover:shadow-md transition-all`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  {record.status === "present" ? (
                                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                                  ) : (
                                    <X className="h-6 w-6 text-red-600 mr-3" />
                                  )}
                                  <div>
                                    <div className="font-bold text-gray-800">
                                      {new Date(record.date).toLocaleDateString("vi-VN", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      Buổi {record.sessionNumber || index + 1}
                                      {record.note && ` • ${record.note}`}
                                    </div>
                                  </div>
                                </div>
                                <span className={`px-4 py-2 rounded-lg font-bold ${
                                  record.status === "present"
                                    ? "bg-green-200 text-green-700"
                                    : "bg-red-200 text-red-700"
                                }`}>
                                  {record.status === "present" ? "Có Mặt" : "Vắng Mặt"}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "requirements" && (
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mr-4">
                        <Shield className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800">
                        Yêu Cầu Tham Gia
                      </h3>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-orange-100 border-2 border-red-200 rounded-2xl p-8 mb-8 shadow-lg">
                      <div className="text-red-700 text-xl leading-relaxed font-medium">
                        {classData.requirements ||
                          "Không có yêu cầu đặc biệt. Phù hợp cho mọi độ tuổi và trình độ."}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-amber-200">
                        Yêu Cầu Chung
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          {
                            icon: User,
                            label: "Huấn Luyện Viên",
                            value: classData.instructorName || "Chưa Có",
                            color: "purple",
                          },
                          {
                            icon: MapPin,
                            label: "Địa Điểm",
                            value: classData.location || "Phòng Tập Chính",
                            color: "blue",
                          },
                          {
                            icon: Clock,
                            label: "Thời Gian",
                            value: formatSchedule(classData.schedule),
                            color: "green",
                          },
                          {
                            icon: Calendar,
                            label: "Thời Gian Khóa Học",
                            value: `${new Date(
                              classData.startDate
                            ).toLocaleDateString("vi-VN")} - ${new Date(
                              classData.endDate
                            ).toLocaleDateString("vi-VN")}`,
                            color: "amber",
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-200"
                          >
                            <div
                              className={`w-14 h-14 bg-${item.color}-100 rounded-2xl flex items-center justify-center flex-shrink-0 border border-${item.color}-200`}
                            >
                              <item.icon
                                className={`h-7 w-7 text-${item.color}-600`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-600 font-semibold mb-1">
                                {item.label}
                              </div>
                              <div className="text-gray-800 font-bold text-lg break-words">
                                {item.value}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* 3. Đăng Ký Lớp Học - Full Width - Hidden when enrolled */}
            {!isEnrolled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                  <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 p-6 text-white relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-3xl font-light mb-2 font-serif tracking-wide opacity-90">
                        登録
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Đăng Ký Lớp Học</h3>
                      <div className="w-16 h-1 bg-white/50 rounded-full mx-auto"></div>
                    </div>

                  <div className="absolute top-4 right-4 opacity-20">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div className="absolute bottom-4 left-4 opacity-20">
                    <Crown className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 opacity-30"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-center mb-3">
                            <DollarSign className="h-5 w-5 text-purple-600 mr-1" />
                            <span className="text-sm text-purple-600 font-bold uppercase tracking-wide">
                              Học Phí
                            </span>
                          </div>
                          <div className="text-4xl font-bold text-purple-700 mb-2 tracking-tight">
                            {classData.price?.toLocaleString() || "0"}
                            <span className="text-xl font-normal">đ</span>
                          </div>
                          <div className="text-sm text-purple-600 font-medium bg-purple-100 inline-block px-3 py-1 rounded-full">
                            / toàn khóa học
                          </div>
                        </div>

                        <div className="absolute -top-2 -right-2">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            HOT
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-1 space-y-4">
                      {[
                        {
                          icon: Users,
                          label: "Học Viên",
                          value: `${classData.currentMembers || 0}`,
                          max: `${classData.maxMembers}`,
                          color: "blue",
                          bgGradient: "from-blue-50 to-cyan-50",
                          borderColor: "border-blue-200",
                        },
                        {
                          icon: Calendar,
                          label: "Tổng Buổi",
                          value: `${classData.totalSessions}`,
                          suffix: "buổi",
                          color: "green",
                          bgGradient: "from-green-50 to-emerald-50",
                          borderColor: "border-green-200",
                        },
                        {
                          icon: MapPin,
                          label: "Địa Điểm",
                          value: classData.location || "Phòng Tập Chính",
                          color: "purple",
                          bgGradient: "from-purple-50 to-violet-50",
                          borderColor: "border-purple-200",
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className={`bg-gradient-to-r ${item.bgGradient} border-2 ${item.borderColor} rounded-xl p-4 hover:shadow-lg transition-all duration-300 group`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center border-2 border-${item.color}-200 group-hover:scale-110 transition-transform`}
                              >
                                <item.icon
                                  className={`h-5 w-5 text-${item.color}-600`}
                                />
                              </div>
                              <div>
                                <div
                                  className={`text-xs text-${item.color}-600 font-semibold mb-1`}
                                >
                                  {item.label}
                                </div>
                                <div className="text-gray-800 font-bold text-sm">
                                  {item.value}
                                  {item.max && (
                                    <span className="text-gray-500 font-normal">
                                      /{item.max}
                                    </span>
                                  )}
                                  {item.suffix && (
                                    <span className="text-xs text-gray-600 ml-1">
                                      {item.suffix}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {item.max && (
                              <div className="text-right">
                                <div
                                  className={`text-xs text-${item.color}-600 font-medium mb-1`}
                                >
                                  {Math.round(
                                    (classData.currentMembers /
                                      classData.maxMembers) *
                                      100
                                  )}
                                  %
                                </div>
                                <div className="w-12 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 h-2 rounded-full transition-all duration-500`}
                                    style={{
                                      width: `${
                                        (classData.currentMembers /
                                          classData.maxMembers) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="lg:col-span-1 space-y-4">
                      {canEnroll ? (
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleEnroll}
                          disabled={enrolling}
                          className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 text-white py-4 rounded-xl font-bold text-base shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group border-2 border-purple-400 mb-4"
                        >
                          <div className="relative z-10 flex items-center justify-center">
                            {enrolling ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span>Đang Xử Lý...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                                <span>Đăng Ký Ngay</span>
                                <Sparkles className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform" />
                              </>
                            )}
                          </div>

                          {!enrolling && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </>
                          )}
                        </motion.button>
                      ) : (
                        <button
                          className="w-full bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300 text-gray-500 py-4 rounded-xl font-bold text-base shadow-lg mb-4 relative overflow-hidden"
                          disabled
                        >
                          <div className="flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            <span className="text-sm">
                              {classData.status === "completed"
                                ? "Lớp Học Đã Kết Thúc"
                                : classData.status === "ongoing"
                                ? "Lớp Học Đang Diễn Ra"
                                : classData.status === "cancelled"
                                ? "Lớp Học Đã Bị Hủy"
                                : classData.currentMembers >=
                                  classData.maxMembers
                                ? "Lớp Học Đã Đầy"
                                : "Không Thể Đăng Ký"}
                            </span>
                          </div>
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 py-3 rounded-lg font-semibold transition-all duration-300 flex flex-col items-center justify-center border-2 border-blue-200 group text-xs"
                        >
                          <MessageCircle className="h-4 w-4 mb-1 group-hover:scale-110 transition-transform" />
                          <span>Tư Vấn</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 py-3 rounded-lg font-semibold transition-all duration-300 flex flex-col items-center justify-center border-2 border-green-200 group text-xs"
                        >
                          <Phone className="h-4 w-4 mb-1 group-hover:scale-110 transition-transform" />
                          <span>Hotline</span>
                        </motion.button>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="text-center mb-3">
                          <div className="inline-flex items-center text-xs text-gray-600 font-medium bg-gray-50 px-3 py-1 rounded-full">
                            <Heart className="h-3 w-3 mr-1 text-red-500" />
                            Hỗ trợ 24/7
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { icon: Mail, label: "Email" },
                            { icon: Globe, label: "Web" },
                            { icon: Phone, label: "Call" },
                            { icon: MessageCircle, label: "Chat" },
                          ].map((item, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex flex-col items-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-300 group"
                            >
                              <item.icon className="h-3 w-3 text-gray-600 mb-1 group-hover:scale-110 transition-transform" />
                              <span className="text-xs text-gray-600 font-medium">
                                {item.label}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
