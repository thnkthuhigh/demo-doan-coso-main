import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Users,
  Calendar,
  MapPin,
  Clock,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";

const TrainerClasses = ({ setActiveModule, setSelectedClassId }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchTrainerClasses();
  }, []);

  const fetchTrainerClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);

      console.log("🔍 Fetching trainer classes...");
      console.log("User ID:", user._id);
      console.log("User Role:", user.role);
      console.log("Token:", token ? "Present" : "Missing");

      const response = await axios.get(
        `http://localhost:5000/api/classes/instructor/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Trainer classes fetched:", response.data);
      console.log("📊 Total classes:", response.data.length);
      setClasses(response.data);
    } catch (error) {
      console.error("❌ Error fetching trainer classes:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(error.response?.data?.message || "Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch = classItem.className
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || classItem.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "ongoing":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "upcoming":
        return "Sắp diễn ra";
      case "ongoing":
        return "Đang diễn ra";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return "Chưa có lịch";
    return schedule
      .map((s) => `${s.dayOfWeek} (${s.startTime} - ${s.endTime})`)
      .join(", ");
  };

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
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl shadow-lg">
            <Dumbbell className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              📚 Lớp Học Của Tôi
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý các lớp học bạn đang giảng dạy
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem, index) => (
            <motion.div
              key={classItem._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-start justify-between mb-3">
                  <Dumbbell className="h-8 w-8" />
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      classItem.status
                    )}`}
                  >
                    {getStatusText(classItem.status)}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {classItem.className}
                </h3>
                <p className="text-white/80 text-sm line-clamp-2">
                  {classItem.description || "Không có mô tả"}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-indigo-600" />
                  <span className="text-sm">
                    {classItem.currentMembers || 0}/{classItem.maxMembers} học viên
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                  <span className="text-sm">
                    {new Date(classItem.startDate).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(classItem.endDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-indigo-600" />
                  <span className="text-sm text-xs">
                    {formatSchedule(classItem.schedule)}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-indigo-600" />
                  <span className="text-sm">
                    {classItem.location || "Chưa có địa điểm"}
                  </span>
                </div>

                {/* Price */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-2xl font-bold text-indigo-600">
                    {classItem.price?.toLocaleString() || 0}đ
                  </div>
                  <div className="text-xs text-gray-500">Học phí</div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex space-x-2">
                <button
                  onClick={() =>
                    (window.location.href = `/classes/${classItem._id}/details`)
                  }
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Xem chi tiết
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Dumbbell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Không tìm thấy lớp học nào
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== "all"
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              : "Bạn chưa được phân công lớp học nào"}
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-indigo-600">
              {classes.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Tổng lớp học</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">
              {classes.filter((c) => c.status === "ongoing").length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Đang diễn ra</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">
              {classes.filter((c) => c.status === "upcoming").length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Sắp diễn ra</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">
              {classes.reduce((sum, c) => sum + (c.currentMembers || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Tổng học viên</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerClasses;
