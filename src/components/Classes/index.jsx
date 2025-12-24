import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  User,
  DollarSign,
  BookOpen,
  Target,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Crown,
  Sparkles,
  Award,
  Heart,
  TrendingUp,
  PlayCircle,
  ArrowRight,
  Shield,
  Cherry,
  Mountain,
  Waves,
  Flower2,
  Leaf,
  Sunrise,
  Moon,
  Zap,
  Gem,
  Activity,
} from "lucide-react";
import { normalizeClassArray } from "../../utils/classDataNormalizer";

export default function ViewClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [userEnrollments, setUserEnrollments] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchServices();
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        if (userData._id) {
          fetchUserEnrollments(userData._id);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/classes");
      
      // ✅ Normalize class data để đồng nhất với mobile
      const normalizedClasses = normalizeClassArray(response.data);
      setClasses(normalizedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      showMessage("❌ Không thể tải danh sách lớp học", "error");
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/services");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchUserEnrollments = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5000/api/classes/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log("Fetched enrollments:", response.data);
      console.log("Total enrollments:", response.data?.length);
      console.log("Unpaid enrollments:", response.data?.filter(e => !e.paymentStatus).length);
      
      // ✅ Normalize enrollment data
      const enrollmentsWithNormalizedClasses = response.data.map(enrollment => ({
        ...enrollment,
        class: enrollment.class ? normalizeClassArray([enrollment.class])[0] : null
      }));
      
      setUserEnrollments(enrollmentsWithNormalizedClasses || []);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      setUserEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (classId) => {
    if (!user) {
      showMessage("❌ Vui lòng đăng nhập để đăng ký lớp học", "error");
      return;
    }

    const isEnrolled = userEnrollments.some(
      (enrollment) => enrollment.class?._id === classId
    );

    if (isEnrolled) {
      showMessage("ℹ️ Bạn đã đăng ký lớp học này rồi", "error");
      return;
    }

    try {
      setEnrolling(classId);
      const token = localStorage.getItem("token");

      if (!token) {
        showMessage("❌ Vui lòng đăng nhập lại", "error");
        return;
      }

      console.log("Enrolling in class:", classId);
      console.log("User:", user);
      console.log("Token:", token ? "exists" : "missing");

      await axios.post(
        "http://localhost:5000/api/classes/enroll",
        { classId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showMessage("✅ Đăng ký lớp học thành công! Chuyển đến giỏ hàng...");
      
      // Refresh enrollments to update UI
      if (user._id) {
        await fetchUserEnrollments(user._id);
      }
      
      // Navigate to cart after a brief delay
      setTimeout(() => {
        navigate("/payment");
      }, 1500);
    } catch (error) {
      console.error("Error enrolling:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Full error:", JSON.stringify(error.response?.data, null, 2));
      
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi đăng ký";
      
      // Nếu lỗi là "đã đăng ký", refresh enrollments và chuyển đến giỏ hàng
      if (errorMessage.includes("đã đăng ký")) {
        showMessage("ℹ️ Bạn đã đăng ký lớp này rồi. Chuyển đến giỏ hàng...", "info");
        
        // Refresh enrollments
        if (user._id) {
          await fetchUserEnrollments(user._id);
        }
        
        // Navigate to cart
        setTimeout(() => {
          navigate("/payment");
        }, 1500);
      } else {
        showMessage(`❌ ${errorMessage}`, "error");
      }
    } finally {
      setEnrolling(null);
    }
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
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
        return `${day}: ${slot.startTime || "Không Có"}-${
          slot.endTime || "Không Có"
        }`;
      })
      .join(", ");
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
          iconBg: "bg-blue-100",
        };
      case "ongoing":
        return {
          text: "Đang Diễn Ra",
          bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          icon: Activity,
          iconBg: "bg-green-100",
        };
      case "completed":
        return {
          text: "Hoàn Thành",
          bgColor: "bg-gradient-to-r from-purple-50 to-violet-50",
          textColor: "text-purple-700",
          borderColor: "border-purple-200",
          icon: Award,
          iconBg: "bg-purple-100",
        };
      case "cancelled":
        return {
          text: "Đã Hủy",
          bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          icon: AlertCircle,
          iconBg: "bg-gray-100",
        };
      default:
        return {
          text: "Không Xác Định",
          bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          icon: Target,
          iconBg: "bg-gray-100",
        };
    }
  };

  const getUserEnrollment = (classId) => {
    return userEnrollments.find(
      (enrollment) => enrollment.class?._id === classId
    );
  };

  const isUserEnrolled = (classId) => {
    const enrollment = getUserEnrollment(classId);
    const enrolled = !!enrollment;
    console.log(`Checking if user enrolled in class ${classId}:`, enrolled);
    if (enrollment) {
      console.log("Enrollment details:", {
        id: enrollment._id,
        classId: enrollment.class?._id,
        paid: enrollment.paymentStatus
      });
    }
    return enrolled;
  };

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.instructorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || cls.status === statusFilter;
    const matchesService = !serviceFilter || cls.serviceName === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  // Hero Stats Component
  const HeroStat = ({ icon: Icon, text, color }) => {
    const getColorClasses = () => {
      switch (color) {
        case "blue":
          return {
            bg: "bg-blue-100",
            text: "text-blue-600",
          };
        case "green":
          return {
            bg: "bg-green-100",
            text: "text-green-600",
          };
        case "purple":
          return {
            bg: "bg-purple-100",
            text: "text-purple-600",
          };
        default:
          return {
            bg: "bg-gray-100",
            text: "text-gray-600",
          };
      }
    };

    const colors = getColorClasses();

    return (
      <div className="text-center group">
        <div
          className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md`}
        >
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>
        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
          {text}
        </span>
      </div>
    );
  };

  // Statistics Card Component
  const StatCard = ({ icon: Icon, label, value, color }) => {
    const getColorClasses = () => {
      switch (color) {
        case "blue":
          return {
            bgCard: "bg-blue-50",
            border: "border-blue-100",
            bgIcon: "bg-blue-500",
            text: "text-blue-600",
          };
        case "green":
          return {
            bgCard: "bg-green-50",
            border: "border-green-100",
            bgIcon: "bg-green-500",
            text: "text-green-600",
          };
        case "amber":
          return {
            bgCard: "bg-amber-50",
            border: "border-amber-100",
            bgIcon: "bg-amber-500",
            text: "text-amber-600",
          };
        case "purple":
          return {
            bgCard: "bg-purple-50",
            border: "border-purple-100",
            bgIcon: "bg-purple-500",
            text: "text-purple-600",
          };
        default:
          return {
            bgCard: "bg-gray-50",
            border: "border-gray-100",
            bgIcon: "bg-gray-500",
            text: "text-gray-600",
          };
      }
    };

    const colors = getColorClasses();

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -8, scale: 1.05 }}
        className={`text-center p-6 ${colors.bgCard} rounded-2xl border-2 ${colors.border} hover:shadow-lg transition-all duration-300 group`}
      >
        <div
          className={`w-16 h-16 ${colors.bgIcon} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
        >
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div className={`text-4xl font-bold ${colors.text} mb-2`}>{value}</div>
        <div className="text-sm text-gray-600 font-semibold">{label}</div>
      </motion.div>
    );
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
          <div className="text-2xl font-light text-gray-800 mb-4 font-serif">
            クラス情報を読み込み中
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Đang Tải Thông Tin Lớp Học...
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

        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 right-10"
        >
          <Flower2 className="h-12 w-12 text-pink-200 opacity-40" />
        </motion.div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        {/* Japanese Hero Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200/50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-300/50 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-300/50 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-light text-gray-800 mb-2 font-serif">
                        フィットネスクラス一覧
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Khám Phá Các Lớp Học
                      </h1>
                      <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-red-500 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg mb-6 max-w-3xl">
                    Tham gia các lớp học đa dạng với huấn luyện viên chuyên
                    nghiệp. Từ Yoga thư giãn đến Boxing mạnh mẽ - tìm lớp học
                    phù hợp với bạn!
                  </p>
                </div>

                <div className="flex items-center space-x-6 mt-6 lg:mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <HeroStat icon={Award} text="50+ Lớp Học" color="blue" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <HeroStat
                      icon={Users}
                      text="1000+ Học Viên"
                      color="green"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <HeroStat
                      icon={Crown}
                      text="Chất Lượng Cao"
                      color="purple"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Message Display */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`mb-8 p-6 rounded-2xl backdrop-blur-sm border-2 shadow-lg ${
                messageType === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full mr-4 flex items-center justify-center ${
                    messageType === "success" ? "bg-green-200" : "bg-red-200"
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </div>
                <span className="font-semibold text-lg">{message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Japanese Filters Section */}
        <motion.div variants={itemVariants} className="mb-12">
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

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-500" />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 text-gray-700 font-medium min-w-48"
                >
                  <option value="">Tất Cả Trạng Thái</option>
                  <option value="upcoming">Sắp Diễn Ra</option>
                  <option value="ongoing">Đang Diễn Ra</option>
                  <option value="completed">Hoàn Thành</option>
                </select>

                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 text-gray-700 font-medium min-w-48"
                >
                  <option value="">Tất Cả Dịch Vụ</option>
                  {services.map((service) => (
                    <option key={service._id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Japanese Classes Grid */}
        {filteredClasses.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-gray-200/50"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-pink-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <BookOpen className="h-16 w-16 text-gray-400" />
            </div>
            <div className="text-3xl font-light text-gray-800 mb-4 font-serif">
              クラスが見つかりません
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Không Tìm Thấy Lớp Học Nào
            </h2>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm lớp học phù hợp
              với bạn.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setServiceFilter("");
              }}
            >
              <Target className="h-6 w-6 mr-3" />
              Xem Tất Cả Lớp Học
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredClasses.map((classItem, index) => {
              const statusInfo = getStatusInfo(classItem.status);
              const StatusIcon = statusInfo.icon;
              const enrollment = getUserEnrollment(classItem._id);
              const isEnrolled = !!enrollment;
              const isPaid = enrollment?.paymentStatus;
              const canEnroll =
                (classItem.status === "upcoming" ||
                  classItem.status === "ongoing") &&
                !isEnrolled;

              return (
                <motion.div
                  key={classItem._id}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="group"
                >
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-2xl hover:border-gray-300/50 transition-all duration-500 h-full flex flex-col">
                    {/* Header Section */}
                    <div className="relative p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <div
                          className={`flex items-center px-3 py-2 rounded-full border-2 ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} backdrop-blur-md shadow-md`}
                        >
                          <StatusIcon className="h-4 w-4 mr-2" />
                          <span className="text-sm font-bold whitespace-nowrap">
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>

                      <div className="pr-28">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {classItem.className || "Tên Lớp Học"}
                        </h3>
                        <div className="flex items-center mb-1">
                          <Star className="h-4 w-4 text-pink-500 mr-1.5 fill-current" />
                          <span className="text-pink-600 font-semibold">
                            {classItem.serviceName || "Dịch Vụ"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-4">
                      <div className="space-y-3">
                        {/* Instructor & Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-2">
                              <User className="h-4 w-4 text-pink-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">
                                HLV
                              </p>
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {classItem.instructorName || "Chưa Có"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">
                                Học Viên
                              </p>
                              <p className="text-sm font-semibold text-gray-800">
                                {classItem.currentMembers || 0}/
                                {classItem.maxMembers}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                              <MapPin className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">
                                Địa Điểm
                              </p>
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {classItem.location || "Phòng Tập Chính"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-2">
                              <DollarSign className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">
                                Học Phí
                              </p>
                              <p className="font-semibold text-green-600 text-sm">
                                {classItem.price?.toLocaleString() || 0}đ
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
                          <p className="text-gray-700 text-xs font-medium">
                            {formatSchedule(classItem.schedule)}
                          </p>
                        </div>

                        {/* Duration */}
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                          <div className="flex items-center mb-1">
                            <Calendar className="h-4 w-4 text-purple-600 mr-1.5" />
                            <span className="text-xs font-semibold text-purple-700">
                              Thời Gian
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs font-medium">
                            {new Date(classItem.startDate).toLocaleDateString(
                              "vi-VN"
                            )}{" "}
                            -{" "}
                            {new Date(classItem.endDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>

                        {/* Description */}
                        {classItem.description && (
                          <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-100">
                            <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
                              {classItem.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 mt-auto">
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            navigate(`/classes/${classItem._id}/details`)
                          }
                          className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Chi Tiết
                        </motion.button>

                        <div className="flex-1 ml-4">
                          {user ? (
                            isEnrolled ? (
                              isPaid ? (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  disabled
                                  className="w-full flex items-center justify-center bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl font-semibold transition-all duration-300"
                                >
                                  <CheckCircle className="h-5 w-5 mr-2" />
                                  Đã Đăng Ký
                                </motion.button>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => {
                                    // Find the enrollment for this class
                                    const enrollment = userEnrollments.find(
                                      (e) => e.class?._id === classItem._id && !e.paymentStatus
                                    );
                                    if (enrollment) {
                                      navigate("/payment", { 
                                        state: { 
                                          autoSelectClass: enrollment._id,
                                          fromClass: true 
                                        } 
                                      });
                                    } else {
                                      navigate("/payment");
                                    }
                                  }}
                                  className="w-full flex items-center justify-center bg-yellow-50 border-2 border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-yellow-100"
                                >
                                  <Clock className="h-5 w-5 mr-2" />
                                  Chờ Thanh Toán
                                </motion.button>
                              )
                            ) : canEnroll ? (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleEnroll(classItem._id)}
                                disabled={enrolling === classItem._id}
                                className="w-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-3 rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl relative overflow-hidden group"
                              >
                                <div className="relative z-10 flex items-center">
                                  {enrolling === classItem._id ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                      Đang Đăng Ký...
                                    </>
                                  ) : (
                                    <>
                                      <BookOpen className="h-5 w-5 mr-2" />
                                      Đăng Ký Ngay
                                    </>
                                  )}
                                </div>
                                {enrolling !== classItem._id && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                )}
                              </motion.button>
                            ) : (
                              <motion.button
                                disabled
                                className="w-full flex items-center justify-center bg-gray-100 border-2 border-gray-300 text-gray-500 px-4 py-3 rounded-xl font-semibold"
                              >
                                <AlertCircle className="h-5 w-5 mr-2" />
                                Không Thể Đăng Ký
                              </motion.button>
                            )
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => navigate("/login")}
                              className="w-full flex items-center justify-center bg-blue-50 border-2 border-blue-200 text-blue-700 px-4 py-3 rounded-xl hover:bg-blue-100 transition-all duration-300 font-semibold"
                            >
                              <User className="h-5 w-5 mr-2" />
                              Đăng Nhập
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar for Ongoing Classes */}
                    {classItem.status === "ongoing" &&
                      classItem.currentSession &&
                      classItem.totalSessions && (
                        <div className="absolute bottom-0 left-0 right-0">
                          <div className="w-full bg-gray-200 h-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${
                                  (classItem.currentSession /
                                    classItem.totalSessions) *
                                  100
                                }%`,
                              }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-1"
                            ></motion.div>
                          </div>
                        </div>
                      )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Japanese Statistics Section */}
        <motion.div variants={itemVariants} className="mt-20">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200/50">
            <div className="text-center mb-12">
              <div className="text-2xl font-light text-gray-800 mb-2 font-serif">
                統計情報
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Thống Kê Lớp Học
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mx-auto"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <StatCard
                icon={BookOpen}
                label="Tổng Lớp Học"
                value={classes.length}
                color="blue"
              />
              <StatCard
                icon={Activity}
                label="Đang Hoạt Động"
                value={classes.filter((c) => c.status === "ongoing").length}
                color="green"
              />
              <StatCard
                icon={Calendar}
                label="Sắp Diễn Ra"
                value={classes.filter((c) => c.status === "upcoming").length}
                color="amber"
              />
              <StatCard
                icon={Users}
                label="Tổng Học Viên"
                value={classes.reduce(
                  (sum, c) => sum + (c.currentMembers || 0),
                  0
                )}
                color="purple"
              />
            </div>

            {/* Features */}
            <div className="pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
                Tại Sao Chọn Chúng Tôi?
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Crown,
                    title: "Chất Lượng Hàng Đầu",
                    description:
                      "Đội ngũ huấn luyện viên chuyên nghiệp với chứng chỉ quốc tế",
                  },
                  {
                    icon: Shield,
                    title: "An Toàn Tuyệt Đối",
                    description:
                      "Thiết bị hiện đại, quy trình an toàn nghiêm ngặt",
                  },
                  {
                    icon: Heart,
                    title: "Tận Tâm Chu Đáo",
                    description:
                      "Hỗ trợ học viên 24/7, cam kết mang lại kết quả tốt nhất",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-7 w-7 text-pink-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
