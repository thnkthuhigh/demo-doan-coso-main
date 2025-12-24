import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  BookOpen,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Users,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  Target,
  Award,
  Cherry,
  Mountain,
  Waves,
  Star,
  Sparkles,
  Crown,
  ArrowRight,
  Heart,
  Activity,
  Zap,
  Gem,
  Flower2,
  Shield,
} from "lucide-react";
import { toast } from "react-toastify";
import { normalizeClassArray, normalizeAttendanceArray } from "../../utils/classDataNormalizer";


export default function UserClasses() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});

  const statusOptions = [
    { value: "all", label: "Tất Cả Lớp Học", icon: Sparkles },
    { value: "paid", label: "Đã Thanh Toán", icon: CheckCircle },
    { value: "pending", label: "Chờ Thanh Toán", icon: AlertTriangle },
    { value: "upcoming", label: "Sắp Diễn Ra", icon: Calendar },
    { value: "ongoing", label: "Đang Học", icon: Activity },
    { value: "completed", label: "Hoàn Thành", icon: Award },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const id = parsedUser._id || parsedUser.id;
        if (id) {
          setUserId(id);
          fetchUserClasses(id);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Lỗi phân tích dữ liệu người dùng:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserClasses = async (uid, showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/classes/user/${uid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Normalize enrollment data
      const enrollmentsWithNormalizedClasses = (response.data || []).map(enrollment => ({
        ...enrollment,
        class: enrollment.class ? normalizeClassArray([enrollment.class])[0] : null
      }));
      
      setEnrollments(enrollmentsWithNormalizedClasses);

      if (response.data && response.data.length > 0) {
        fetchAttendanceData(uid);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lớp học của người dùng:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn");
        navigate("/login");
      } else {
        toast.error("Không thể tải danh sách lớp học");
      }
      setEnrollments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAttendanceData = async (uid) => {
    try {
      const token = localStorage.getItem("token");
      
      // ✅ Sử dụng API mới: /api/attendance/my-history
      const response = await axios.get(
        `http://localhost:5000/api/attendance/my-history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Normalize attendance data
      const normalizedAttendances = normalizeAttendanceArray(response.data);
      
      const attendanceByClass = {};
      normalizedAttendances.forEach((record) => {
        const classId = record.classInfo?._id || record.classId?._id || record.classId;
        if (!attendanceByClass[classId]) {
          attendanceByClass[classId] = {
            total: 0,
            attended: 0,
            missed: 0,
          };
        }
        attendanceByClass[classId].total++;
        if (record.isPresent || record.status === 'present') {
          attendanceByClass[classId].attended++;
        } else {
          attendanceByClass[classId].missed++;
        }
      });

      setAttendanceData(attendanceByClass);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu điểm danh:", error);
    }
  };

  const handleRefresh = () => {
    if (userId) {
      fetchUserClasses(userId, false);
    }
  };

  const getStatusInfo = (enrollment) => {
    const classStatus = enrollment.class?.status;
    const paymentStatus = enrollment.paymentStatus;

    if (!paymentStatus) {
      return {
        color: "amber",
        icon: AlertTriangle,
        text: "Chờ Thanh Toán",
        bgColor: "bg-gradient-to-r from-amber-50 to-orange-50",
        borderColor: "border-amber-200",
        textColor: "text-amber-700",
        iconBg: "bg-amber-100",
      };
    }

    switch (classStatus) {
      case "upcoming":
        return {
          color: "blue",
          icon: Calendar,
          text: "Sắp Diễn Ra",
          bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-700",
          iconBg: "bg-blue-100",
        };
      case "ongoing":
        return {
          color: "green",
          icon: Activity,
          text: "Đang Diễn Ra",
          bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          iconBg: "bg-green-100",
        };
      case "completed":
        return {
          color: "purple",
          icon: Award,
          text: "Hoàn Thành",
          bgColor: "bg-gradient-to-r from-purple-50 to-violet-50",
          borderColor: "border-purple-200",
          textColor: "text-purple-700",
          iconBg: "bg-purple-100",
        };
      default:
        return {
          color: "gray",
          icon: XCircle,
          text: "Không Xác Định",
          bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-700",
          iconBg: "bg-gray-100",
        };
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return "Chưa Có Lịch";

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
        return `${day}: ${slot.startTime || "Không Có"} - ${
          slot.endTime || "Không Có"
        }`;
      })
      .join(", ");
  };

  const getAttendanceStats = (classId) => {
    const data = attendanceData[classId];
    if (!data || data.total === 0) {
      return { rate: 0, attended: 0, total: 0 };
    }
    return {
      rate: Math.round((data.attended / data.total) * 100),
      attended: data.attended,
      total: data.total,
    };
  };

  const getProgressPercent = (enrollment) => {
    const currentSession = enrollment.class?.currentSession || 0;
    const totalSessions = enrollment.class?.totalSessions || 0;
    return totalSessions > 0 ? (currentSession / totalSessions) * 100 : 0;
  };

  const getRemainingSessionsCount = (enrollment) => {
    const totalSessions = enrollment.class?.totalSessions || 0;
    const currentSession = enrollment.class?.currentSession || 0;
    return Math.max(0, totalSessions - currentSession);
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.class?.className
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.class?.serviceName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.class?.instructorName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "all") return true;
    if (filterStatus === "paid") return enrollment.paymentStatus;
    if (filterStatus === "pending") return !enrollment.paymentStatus;
    if (filterStatus === "ongoing")
      return enrollment.class?.status === "ongoing";
    if (filterStatus === "completed")
      return enrollment.class?.status === "completed";
    if (filterStatus === "upcoming")
      return enrollment.class?.status === "upcoming";

    return true;
  });

  // Statistics
  const stats = {
    total: enrollments.length,
    paid: enrollments.filter((e) => e.paymentStatus).length,
    pending: enrollments.filter((e) => !e.paymentStatus).length,
    ongoing: enrollments.filter((e) => e.class?.status === "ongoing").length,
    completed: enrollments.filter((e) => e.class?.status === "completed")
      .length,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
        {/* Japanese Loading Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <Cherry className="h-8 w-8 text-pink-500 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-light text-gray-800 mb-4">
            学習データを読み込み中
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Đang Tải Dữ Liệu Học Tập...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-pink-50 relative overflow-hidden"
    >
      {/* Japanese Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10"
        >
          <Cherry className="h-16 w-16 text-pink-300 opacity-40" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute top-40 right-20"
        >
          <Mountain className="h-20 w-20 text-blue-300 opacity-30" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
          className="absolute bottom-40 left-1/4"
        >
          <Waves className="h-14 w-14 text-cyan-300 opacity-35" />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Japanese Hero Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200/50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-300/50 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-300/50 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="text-4xl font-light text-gray-800 mb-2 font-serif">
                        私の学習スケジュール
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Lịch Học Của Tôi
                      </h1>
                      <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-red-500 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg mb-6 max-w-2xl">
                    Theo dõi tiến độ học tập và quản lý các lớp học bạn đã đăng
                    ký. Khám phá hành trình fitness của bạn với những thống kê
                    chi tiết.
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 group shadow-md"
                  >
                    <RefreshCw
                      className={`h-5 w-5 mr-2 text-gray-600 group-hover:text-pink-600 ${
                        refreshing ? "animate-spin" : ""
                      }`}
                    />
                    <span className="text-gray-700 group-hover:text-pink-700 font-medium">
                      Làm Mới
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/classes")}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-2xl hover:from-pink-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl group"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    <span className="font-medium">Đăng Ký Thêm</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Japanese Statistics Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12"
        >
          {[
            {
              icon: BarChart3,
              value: stats.total,
              label: "Tổng Lớp Học",
              color: "blue",
              gradient: "from-blue-500 to-indigo-500",
            },
            {
              icon: CheckCircle,
              value: stats.paid,
              label: "Đã Thanh Toán",
              color: "green",
              gradient: "from-green-500 to-emerald-500",
            },
            {
              icon: AlertTriangle,
              value: stats.pending,
              label: "Chờ Thanh Toán",
              color: "amber",
              gradient: "from-amber-500 to-orange-500",
            },
            {
              icon: Activity,
              value: stats.ongoing,
              label: "Đang Học",
              color: "purple",
              gradient: "from-purple-500 to-violet-500",
            },
            {
              icon: Award,
              value: stats.completed,
              label: "Hoàn Thành",
              color: "pink",
              gradient: "from-pink-500 to-rose-500",
            },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-2xl hover:border-gray-300/50 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Japanese Filter Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm lớp học, huấn luyện viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 text-gray-700 placeholder-gray-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 text-gray-700 font-medium min-w-48"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Japanese Classes Grid */}
        {filteredEnrollments.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-gray-200/50"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-pink-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <BookOpen className="h-16 w-16 text-gray-400" />
            </div>
            <div className="text-3xl font-light text-gray-800 mb-4 font-serif">
              学習記録なし
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {enrollments.length === 0
                ? "Bạn Chưa Đăng Ký Lớp Học Nào"
                : "Không Tìm Thấy Lớp Học"}
            </h2>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              {enrollments.length === 0
                ? "Khám phá các lớp học của chúng tôi và bắt đầu hành trình fitness của bạn ngay hôm nay."
                : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm lớp học phù hợp."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate("/classes")}
            >
              <BookOpen className="h-6 w-6 mr-3" />
              Đăng Ký Ngay
              <ArrowRight className="h-5 w-5 ml-3" />
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEnrollments.map((enrollment, index) => {
              const statusInfo = getStatusInfo(enrollment);
              const attendanceStats = getAttendanceStats(enrollment.class?._id);
              const progressPercent = getProgressPercent(enrollment);
              const remainingSessions = getRemainingSessionsCount(enrollment);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={enrollment._id}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="group"
                >
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl hover:border-gray-300/50 transition-all duration-500 h-full flex flex-col">
                    {/* Header Section */}
                    <div className="relative p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <div
                          className={`flex items-center px-3 py-1.5 rounded-full border-2 ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} backdrop-blur-md shadow-md`}
                        >
                          <StatusIcon className="h-4 w-4 mr-1.5" />
                          <span className="text-xs font-bold whitespace-nowrap">
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>

                      <div className="pr-28">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {enrollment.class?.className || "Tên Lớp Học"}
                        </h3>
                        <div className="flex items-center mb-1">
                          <Star className="h-4 w-4 text-pink-500 mr-1.5 fill-current" />
                          <span className="text-sm text-pink-600 font-semibold">
                            {enrollment.class?.serviceName || "Dịch Vụ"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-4">
                      <div className="space-y-3">
                        {/* Instructor & Location */}
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-2">
                              <User className="h-4 w-4 text-pink-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">
                                Huấn Luyện Viên
                              </p>
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {enrollment.class?.instructorName || "Chưa Có"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">
                                Địa Điểm
                              </p>
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {enrollment.class?.location ||
                                  "Phòng Tập Chính"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Schedule */}
                        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                          <div className="flex items-center mb-1">
                            <Clock className="h-4 w-4 text-blue-600 mr-1.5" />
                            <span className="text-xs font-semibold text-blue-700">
                              Lịch Học
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium text-xs">
                            {formatSchedule(enrollment.class?.schedule)}
                          </p>
                        </div>

                        {/* Progress */}
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-purple-700">
                              Tiến Độ Học Tập
                            </span>
                            <span className="text-xs font-bold text-purple-600">
                              {enrollment.class?.currentSession || 0} /{" "}
                              {enrollment.class?.totalSessions || 0} buổi
                            </span>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </motion.div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-purple-600 font-medium">
                              {progressPercent.toFixed(1)}% hoàn thành
                            </span>
                            <span className="text-xs font-semibold text-purple-600">
                              Còn lại: {remainingSessions} buổi
                            </span>
                          </div>
                        </div>

                        {/* Attendance */}
                        {attendanceStats.total > 0 && (
                          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-green-700">
                                Điểm Danh
                              </span>
                              <span className="text-xs font-bold text-green-600">
                                {attendanceStats.rate}% (
                                {attendanceStats.attended}/
                                {attendanceStats.total})
                              </span>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${attendanceStats.rate}%` }}
                                transition={{
                                  duration: 1,
                                  delay: index * 0.1 + 0.3,
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                              ></motion.div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 mt-auto">
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              navigate(
                                `/classes/${enrollment.class?._id}/details`
                              )
                            }
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-xs transition-colors bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Chi Tiết
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setShowDetailModal(true);
                            }}
                            className="flex items-center text-purple-600 hover:text-purple-700 font-medium text-xs transition-colors bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg"
                          >
                            <BarChart3 className="h-3.5 w-3.5 mr-1" />
                            Thống Kê
                          </motion.button>
                        </div>

                        {!enrollment.paymentStatus && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/payment")}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg"
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Thanh Toán
                          </motion.button>
                        )}
                      </div>

                      <div className="mt-3 text-right">
                        <span className="text-xs text-gray-500">
                          Đăng ký:{" "}
                          {new Date(
                            enrollment.enrollmentDate
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Enhanced Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedEnrollment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/95 backdrop-blur-md rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-200/50"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-pink-50 via-blue-50 to-purple-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl font-light text-gray-800 mb-2 ">
                        Chi Tiết Lớp Học
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        {selectedEnrollment.class?.className}
                      </h2>
                      <p className="text-gray-600 text-lg">
                        {selectedEnrollment.class?.serviceName}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowDetailModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                    >
                      <XCircle className="h-8 w-8" />
                    </motion.button>
                  </div>
                </div>

                <div className="p-8">
                  {/* Statistics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
                    {[
                      {
                        value: selectedEnrollment.class?.currentSession || 0,
                        label: "Buổi Đã Học",
                        color: "blue",
                        icon: BookOpen,
                      },
                      {
                        value: selectedEnrollment.class?.totalSessions || 0,
                        label: "Tổng Buổi Học",
                        color: "gray",
                        icon: Target,
                      },
                      {
                        value: getRemainingSessionsCount(selectedEnrollment),
                        label: "Buổi Còn Lại",
                        color: "amber",
                        icon: Clock,
                      },
                      {
                        value: getAttendanceStats(selectedEnrollment.class?._id)
                          .attended,
                        label: "Đã Tham Gia",
                        color: "green",
                        icon: CheckCircle,
                      },
                      {
                        value: `${
                          getAttendanceStats(selectedEnrollment.class?._id).rate
                        }%`,
                        label: "Tỷ Lệ Tham Gia",
                        color: "purple",
                        icon: TrendingUp,
                      },
                    ].map((stat, index) => {
                      const IconComponent = stat.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`text-center p-6 bg-${stat.color}-50 rounded-2xl border-2 border-${stat.color}-100 hover:shadow-lg transition-all duration-300`}
                        >
                          <div
                            className={`w-12 h-12 bg-${stat.color}-500 rounded-xl flex items-center justify-center mx-auto mb-4`}
                          >
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div
                            className={`text-3xl font-bold text-${stat.color}-600 mb-2`}
                          >
                            {stat.value}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {stat.label}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Additional Information */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Class Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                        <Shield className="h-6 w-6 mr-2" />
                        Thông Tin Lớp Học
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">
                            Huấn luyện viên:
                          </span>
                          <span className="font-semibold text-gray-800">
                            {selectedEnrollment.class?.instructorName ||
                              "Chưa có"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Địa điểm:</span>
                          <span className="font-semibold text-gray-800">
                            {selectedEnrollment.class?.location ||
                              "Phòng tập chính"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Học phí:</span>
                          <span className="font-semibold text-green-600">
                            {selectedEnrollment.class?.price?.toLocaleString() ||
                              0}
                            đ
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">
                            Trạng thái thanh toán:
                          </span>
                          <span
                            className={`font-semibold ${
                              selectedEnrollment.paymentStatus
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          >
                            {selectedEnrollment.paymentStatus
                              ? "Đã thanh toán"
                              : "Chờ thanh toán"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Information */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                      <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                        <Activity className="h-6 w-6 mr-2" />
                        Tiến Độ Học Tập
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">
                              Tiến độ tổng thể:
                            </span>
                            <span className="font-bold text-purple-600">
                              {getProgressPercent(selectedEnrollment).toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                              style={{
                                width: `${getProgressPercent(
                                  selectedEnrollment
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {getAttendanceStats(selectedEnrollment.class?._id)
                          .total > 0 && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">
                                Tỷ lệ tham gia:
                              </span>
                              <span className="font-bold text-green-600">
                                {
                                  getAttendanceStats(
                                    selectedEnrollment.class?._id
                                  ).rate
                                }
                                %
                              </span>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                                style={{
                                  width: `${
                                    getAttendanceStats(
                                      selectedEnrollment.class?._id
                                    ).rate
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
