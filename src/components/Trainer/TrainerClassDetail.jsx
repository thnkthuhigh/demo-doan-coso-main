import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Target,
  Award,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";

const TrainerClassDetail = ({ classId, onBack }) => {
  const [classData, setClassData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId) {
      fetchClassDetail();
      fetchEnrollments();
    }
  }, [classId]);

  const fetchClassDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/classes/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("📚 Class Detail:", response.data);
      setClassData(response.data);
    } catch (error) {
      console.error("Error fetching class detail:", error);
      toast.error("Không thể tải thông tin lớp học");
    }
  };

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/classes/${classId}/enrollments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("👥 Enrollments:", response.data);
      setEnrollments(response.data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: "bg-blue-100 text-blue-700 border-blue-300",
      ongoing: "bg-green-100 text-green-700 border-green-300",
      completed: "bg-gray-100 text-gray-700 border-gray-300",
      cancelled: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusText = (status) => {
    const texts = {
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã hoàn thành",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy thông tin lớp học</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">
            📚 {classData.className}
          </h1>
          <p className="text-gray-600 mt-1">Chi tiết lớp học</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(
            classData.status
          )}`}
        >
          {getStatusText(classData.status)}
        </span>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Class Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">Mô Tả</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {classData.description || "Chưa có mô tả"}
            </p>
          </motion.div>

          {/* Schedule Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">Lịch Học</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-sm text-indigo-600 font-semibold mb-1">
                  Ngày bắt đầu
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {new Date(classData.startDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600 font-semibold mb-1">
                  Ngày kết thúc
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {new Date(classData.endDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600 font-semibold mb-1">
                  Thời gian
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {classData.schedule || "Chưa cập nhật"}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600 font-semibold mb-1">
                  Tổng buổi học
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {classData.totalSessions || 0} buổi
                </p>
              </div>
            </div>
          </motion.div>

          {/* Students List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  Danh Sách Học Viên
                </h2>
              </div>
              <span className="text-sm text-gray-600">
                {enrollments.length} học viên
              </span>
            </div>

            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có học viên đăng ký</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment, index) => (
                  <div
                    key={enrollment._id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {enrollment.user?.fullName || "Chưa cập nhật"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {enrollment.user?.email || ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Đăng ký lúc</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {new Date(enrollment.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
          >
            <h3 className="text-lg font-bold mb-4">Thống Kê Nhanh</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Học viên</span>
                </div>
                <span className="text-2xl font-bold">
                  {enrollments.length}/{classData.maxMembers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Tỷ lệ lấp đầy</span>
                </div>
                <span className="text-2xl font-bold">
                  {Math.round(
                    (enrollments.length / classData.maxMembers) * 100
                  )}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Buổi học</span>
                </div>
                <span className="text-2xl font-bold">
                  {classData.totalSessions || 0}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-3">
              <MapPin className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-800">Địa Điểm</h3>
            </div>
            <p className="text-gray-700">
              {classData.location || "Chưa cập nhật"}
            </p>
          </motion.div>

          {/* Price */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-3">
              <DollarSign className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-800">Học Phí</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {classData.price?.toLocaleString("vi-VN")}đ
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Doanh thu:{" "}
              {(classData.price * enrollments.length).toLocaleString("vi-VN")}đ
            </p>
          </motion.div>

          {/* Service Info */}
          {classData.service && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Dịch Vụ</h3>
              </div>
              <p className="font-semibold text-gray-800">
                {classData.service.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {classData.service.description}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerClassDetail;
