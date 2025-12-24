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
} from "lucide-react";
import { toast } from "react-toastify";

const StudentAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

      // Fetch user's enrolled classes
      const response = await axios.get(
        `http://localhost:5000/api/users/${user._id}/enrollments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const enrolledClasses = response.data
        .filter((enrollment) => enrollment.class)
        .map((enrollment) => enrollment.class);

      setClasses(enrolledClasses);
      if (enrolledClasses.length > 0) {
        setSelectedClass(enrolledClasses[0]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);

      const response = await axios.get(
        `http://localhost:5000/api/attendance/student/${user._id}/class/${selectedClass._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAttendance(response.data || []);
      calculateStats(response.data || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      // Don't show error toast, just set empty array
      setAttendance([]);
      calculateStats([]);
    }
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có lớp học
          </h3>
          <p className="text-gray-500">
            Bạn chưa đăng ký lớp học nào. Hãy đăng ký lớp để xem điểm danh.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">📝 Điểm Danh Của Tôi</h1>
        <p className="text-gray-600 mt-1">
          Xem lịch sử điểm danh trong các lớp học
        </p>
      </div>

      {/* Class Selection */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Chọn Lớp Học
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <button
              key={cls._id}
              onClick={() => setSelectedClass(cls)}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedClass?._id === cls._id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-800"
              }`}
            >
              <div className="font-semibold mb-1">{cls.className}</div>
              <div className="text-sm opacity-80">{cls.schedule}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {selectedClass && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-bold text-blue-700">
                {stats.total}
              </span>
            </div>
            <p className="text-sm font-semibold text-blue-600">Tổng Buổi</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <span className="text-3xl font-bold text-green-700">
                {stats.present}
              </span>
            </div>
            <p className="text-sm font-semibold text-green-600">Có Mặt</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200"
          >
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <span className="text-3xl font-bold text-red-700">
                {stats.absent}
              </span>
            </div>
            <p className="text-sm font-semibold text-red-600">Vắng Mặt</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-gradient-to-br rounded-2xl p-6 border-2 ${
              stats.rate >= 80
                ? "from-green-50 to-emerald-50 border-green-200"
                : stats.rate >= 60
                ? "from-yellow-50 to-orange-50 border-yellow-200"
                : "from-red-50 to-pink-50 border-red-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-purple-600" />
              <span className="text-3xl font-bold text-purple-700">
                {stats.rate}%
              </span>
            </div>
            <p className="text-sm font-semibold text-purple-600">Tỷ Lệ</p>
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
