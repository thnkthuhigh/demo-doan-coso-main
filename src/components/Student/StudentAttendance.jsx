import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  Target,
  ArrowLeft,
  Book,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { normalizeClassArray } from "../../utils/classDataNormalizer";

const StudentAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("overview"); // "overview" or "detail"
  const [classStats, setClassStats] = useState({}); // Stats for all classes

  useEffect(() => {
    fetchEnrolledClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAttendanceHistory();
    }
  }, [selectedClass]);

  const fetchEnrolledClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);

      console.log("🔍 Fetching enrollments for user:", user._id);

      // Fetch user's enrolled classes
      const response = await axios.get(
        `http://localhost:5000/api/classes/user/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📦 Enrollment response:", response.data);

      // Extract classes from enrollments
      const enrolledClasses = response.data
        .filter((enrollment) => enrollment.class)
        .map((enrollment) => enrollment.class);

      console.log("🏫 Enrolled classes:", enrolledClasses);

      // Normalize class data
      const normalizedClasses = normalizeClassArray(enrolledClasses);

      console.log("✅ Normalized classes:", normalizedClasses);

      setClasses(normalizedClasses);
      
      // Fetch attendance stats for all classes
      await fetchAllClassStats(normalizedClasses, user._id, token);
      
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClassStats = async (classList, userId, token) => {
    try {
      const statsPromises = classList.map(async (cls) => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/attendance/my-history/${cls._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          console.log(`📊 Attendance data for class ${cls.name}:`, response.data);
          
          // API returns object with attendance array inside
          let attendanceData = response.data;
          
          // If response is object, extract array from 'attendance' field
          if (!Array.isArray(attendanceData)) {
            attendanceData = attendanceData.attendance || attendanceData.history || attendanceData.records || [];
          }
          
          console.log(`📊 Processed attendance array:`, attendanceData);
          
          const total = attendanceData.length;
          const present = attendanceData.filter((a) => a.status === "present").length;
          const absent = attendanceData.filter((a) => a.status === "absent").length;
          const rate = total > 0 ? Math.round((present / total) * 100) : 0;
          
          return {
            classId: cls._id,
            total,
            present,
            absent,
            rate,
          };
        } catch (error) {
          console.error(`Error fetching stats for class ${cls._id}:`, error);
          return {
            classId: cls._id,
            total: 0,
            present: 0,
            absent: 0,
            rate: 0,
          };
        }
      });
      
      const statsResults = await Promise.all(statsPromises);
      const statsMap = {};
      statsResults.forEach((stat) => {
        statsMap[stat.classId] = stat;
      });
      
      setClassStats(statsMap);
    } catch (error) {
      console.error("Error fetching class stats:", error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/attendance/my-history/${selectedClass._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle response format (might be array or object with array inside)
      let attendanceData = response.data;
      if (!Array.isArray(attendanceData)) {
        attendanceData = attendanceData.attendance || attendanceData.history || attendanceData.records || [];
      }

      setAttendance(attendanceData);
      calculateStats(attendanceData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      // Don't show error toast, just set empty array
      setAttendance([]);
      calculateStats([]);
    }
  };

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    setViewMode("detail");
  };

  const handleBackToOverview = () => {
    setViewMode("overview");
    setSelectedClass(null);
  };

  const calculateStats = (attendanceData) => {
    const total = attendanceData.length;
    const present = attendanceData.filter((a) => a.status === "present").length;
    const absent = attendanceData.filter((a) => a.status === "absent").length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    setStats({
      total,
      present,
      absent,
      rate,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-50 border-green-200";
      case "absent":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "absent":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "present":
        return "Có mặt";
      case "absent":
        return "Vắng mặt";
      default:
        return "Chưa điểm danh";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-8 pt-24 pb-16 min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có lớp học
          </h3>
          <p className="text-gray-500 mb-4">
            Bạn chưa đăng ký lớp học nào. Hãy đăng ký lớp để xem điểm danh.
          </p>
          <a 
            href="/classes" 
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Đăng ký lớp học
          </a>
        </div>
      </div>
    );
  }

  // Overview Mode - Show all classes
  if (viewMode === "overview") {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-8 pt-24 pb-16 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📚 Lớp Học Đang Tham Gia</h1>
          <p className="text-gray-600 mt-1">
            Xem tổng quan điểm danh các lớp học của bạn
          </p>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const stat = classStats[cls._id] || { total: 0, present: 0, absent: 0, rate: 0 };
            
            return (
              <motion.div
                key={cls._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => handleSelectClass(cls)}
                className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-indigo-500"
              >
                {/* Class Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-2">
                      {cls.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {cls.schedule && Array.isArray(cls.schedule) && cls.schedule.length > 0
                        ? cls.schedule.map(s => {
                            const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                            return `${days[s.dayOfWeek]} ${s.startTime}-${s.endTime}`;
                          }).join(', ')
                        : 'Chưa có lịch'}
                    </p>
                  </div>
                  <Book className="h-8 w-8 text-indigo-500" />
                </div>

                {/* Instructor */}
                {cls.instructor && (
                  <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      {typeof cls.instructor === 'object' ? cls.instructor.fullName : cls.instructor}
                    </span>
                  </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stat.total}</div>
                    <div className="text-xs text-blue-600 font-medium">Tổng</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{stat.present}</div>
                    <div className="text-xs text-green-600 font-medium">Có mặt</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">{stat.absent}</div>
                    <div className="text-xs text-red-600 font-medium">Vắng</div>
                  </div>
                </div>

                {/* Attendance Rate Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Tỷ lệ tham gia</span>
                    <span className={`font-bold ${
                      stat.rate >= 80 ? 'text-green-600' :
                      stat.rate >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {stat.rate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.rate}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        stat.rate >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        stat.rate >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                    />
                  </div>
                </div>

                {/* View Details Link */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-indigo-600 font-medium text-sm group-hover:text-indigo-700">
                    <span>Xem chi tiết</span>
                    <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Detail Mode - Show attendance details for selected class
  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-4 pt-24 pb-16 min-h-screen">
      {/* Back Button */}
      <button
        onClick={handleBackToOverview}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
        Quay lại danh sách lớp
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">📝 Điểm Danh - {selectedClass?.name}</h1>
        <p className="text-gray-600 mt-1">
          Lịch sử điểm danh chi tiết
        </p>
      </div>

      {/* Stats Cards */}
      {selectedClass && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200"
          >
            <div className="flex items-center justify-between mb-1">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">
                {stats.total}
              </span>
            </div>
            <p className="text-xs font-semibold text-blue-600">Tổng Buổi</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200"
          >
            <div className="flex items-center justify-between mb-1">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <span className="text-2xl font-bold text-green-700">
                {stats.present}
              </span>
            </div>
            <p className="text-xs font-semibold text-green-600">Có Mặt</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-200"
          >
            <div className="flex items-center justify-between mb-1">
              <XCircle className="h-6 w-6 text-red-600" />
              <span className="text-2xl font-bold text-red-700">
                {stats.absent}
              </span>
            </div>
            <p className="text-xs font-semibold text-red-600">Vắng Mặt</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-gradient-to-br rounded-xl p-4 border-2 ${
              stats.rate >= 80
                ? "from-green-50 to-emerald-50 border-green-200"
                : stats.rate >= 60
                ? "from-yellow-50 to-orange-50 border-yellow-200"
                : "from-red-50 to-pink-50 border-red-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Target className="h-6 w-6 text-purple-600" />
              <span className="text-2xl font-bold text-purple-700">
                {stats.rate}%
              </span>
            </div>
            <p className="text-xs font-semibold text-purple-600">Tỷ Lệ</p>
          </motion.div>
        </div>
      )}

      {/* Attendance History */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Lịch Sử Điểm Danh - {selectedClass.className}
          </h3>

          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có dữ liệu điểm danh</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendance.map((record, index) => (
                <motion.div
                  key={record._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 ${getStatusColor(
                    record.status
                  )}`}
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {new Date(record.date).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(record.date).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full font-semibold ${
                      record.status === "present"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {getStatusText(record.status)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tips */}
      {selectedClass && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200"
        >
          <div className="flex items-start space-x-3">
            <Award className="h-6 w-6 text-purple-600 mt-1" />
            <div>
              <h4 className="font-bold text-purple-800 mb-2">💡 Gợi Ý</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {stats.rate >= 80 ? (
                  <li>
                    ✨ Tuyệt vời! Tỷ lệ tham gia của bạn rất cao ({stats.rate}
                    %). Hãy tiếp tục duy trì!
                  </li>
                ) : stats.rate >= 60 ? (
                  <li>
                    ⚠️ Tỷ lệ tham gia của bạn ở mức khá ({stats.rate}%). Hãy cố
                    gắng tham gia đều đặn hơn.
                  </li>
                ) : (
                  <li>
                    ⚠️ Tỷ lệ tham gia của bạn thấp ({stats.rate}%). Hãy cố gắng
                    tham gia lớp học thường xuyên hơn.
                  </li>
                )}
                <li>
                  📊 Bạn đã tham gia {stats.present}/{stats.total} buổi học
                </li>
                {stats.absent > 0 && (
                  <li>
                    ⏰ Bạn đã vắng mặt {stats.absent} buổi. Hãy liên hệ huấn
                    luyện viên nếu cần.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentAttendance;
