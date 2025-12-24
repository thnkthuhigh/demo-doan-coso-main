import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  TrendingUp,
  Calendar,
  Award,
  Flame,
  Activity,
  Zap,
  Trophy,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Goals() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetValue: "",
    currentValue: "",
    unit: "",
    targetDate: "",
    category: "fitness",
  });

  const categories = [
    { value: "fitness", label: "Thể lực", icon: Activity },
    { value: "weight", label: "Cân nặng", icon: TrendingUp },
    { value: "muscle", label: "Cơ bắp", icon: Zap },
    { value: "attendance", label: "Điểm danh", icon: CheckCircle },
    { value: "other", label: "Khác", icon: Target },
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData._id) {
      toast.error("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }
    setUser(userData);
    fetchGoals(userData._id);
    fetchStats(userData._id);
  }, [navigate]);

  const fetchGoals = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/goals/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGoals(response.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
      if (error.response?.status !== 404) {
        toast.error("Không thể tải mục tiêu");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/goals/user/${userId}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.targetValue) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const dataToSend = {
        ...formData,
        userId: user._id,
      };

      if (editingGoal) {
        await axios.put(
          `http://localhost:5000/api/goals/${editingGoal._id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("✅ Cập nhật thành công!");
      } else {
        await axios.post("http://localhost:5000/api/goals", dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ Thêm mục tiêu thành công!");
      }

      resetForm();
      fetchGoals(user._id);
      fetchStats(user._id);
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("Lỗi khi lưu mục tiêu");
    }
  };

  const handleUpdateProgress = async (goalId, newValue) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/goals/${goalId}/progress`,
        { currentValue: parseFloat(newValue) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Cập nhật tiến độ");
      fetchGoals(user._id);
      fetchStats(user._id);
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Lỗi khi cập nhật");
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      targetValue: goal.targetValue,
      currentValue: goal.currentValue || 0,
      unit: goal.unit || "",
      targetDate: goal.targetDate
        ? new Date(goal.targetDate).toISOString().split("T")[0]
        : "",
      category: goal.category || "fitness",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa mục tiêu này?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Đã xóa");
      fetchGoals(user._id);
      fetchStats(user._id);
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Lỗi khi xóa");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      targetValue: "",
      currentValue: "",
      unit: "",
      targetDate: "",
      category: "fitness",
    });
    setEditingGoal(null);
    setShowAddModal(false);
  };

  const getProgress = (current, target) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.icon : Target;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mục Tiêu Của Tôi
            </h1>
            <p className="text-gray-600">Đặt mục tiêu và theo dõi tiến độ</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm Mục Tiêu
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Tổng mục tiêu</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Flame className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Đang thực hiện</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.inProgress}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Tỉ lệ hoàn thành</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.completionRate}%
              </p>
            </motion.div>
          </div>
        )}

        {/* Goals List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh Sách Mục Tiêu
            </h2>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có mục tiêu nào
              </h3>
              <p className="text-gray-500 mb-4">
                Đặt mục tiêu để bắt đầu hành trình của bạn
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tạo Mục Tiêu Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {goals.map((goal) => {
                const progress = getProgress(
                  goal.currentValue,
                  goal.targetValue
                );
                const IconComponent = getCategoryIcon(goal.category);
                const isCompleted = progress >= 100;
                const daysLeft = goal.targetDate
                  ? Math.ceil(
                      (new Date(goal.targetDate) - new Date()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;

                return (
                  <motion.div
                    key={goal._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {goal.title}
                            </h3>
                            {goal.description && (
                              <p className="text-sm text-gray-600">
                                {goal.description}
                              </p>
                            )}
                          </div>
                          {isCompleted && (
                            <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Hoàn thành
                            </span>
                          )}
                        </div>

                        <div className="ml-14">
                          {/* Progress Bar */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">
                                {goal.currentValue} / {goal.targetValue}{" "}
                                {goal.unit}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${getProgressColor(
                                  progress
                                )}`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Quick Progress Update */}
                          <div className="flex items-center space-x-2 mt-3">
                            <label className="text-sm text-gray-600">
                              Cập nhật:
                            </label>
                            <input
                              type="number"
                              defaultValue={goal.currentValue}
                              onBlur={(e) =>
                                handleUpdateProgress(goal._id, e.target.value)
                              }
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            {daysLeft !== null && (
                              <span className="text-sm text-gray-500">
                                {daysLeft > 0 ? (
                                  <>
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    {daysLeft} ngày còn lại
                                  </>
                                ) : (
                                  <span className="text-red-500">
                                    Đã hết hạn
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full"
              >
                <div className="px-6 py-4 border-b">
                  <h3 className="text-xl font-semibold">
                    {editingGoal ? "Cập Nhật Mục Tiêu" : "Thêm Mục Tiêu Mới"}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiêu đề *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Danh mục
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá trị mục tiêu *
                        </label>
                        <input
                          type="number"
                          name="targetValue"
                          value={formData.targetValue}
                          onChange={handleInputChange}
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Đơn vị
                        </label>
                        <input
                          type="text"
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          placeholder="kg, km, buổi..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá trị hiện tại
                        </label>
                        <input
                          type="number"
                          name="currentValue"
                          value={formData.currentValue}
                          onChange={handleInputChange}
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hạn chót
                        </label>
                        <input
                          type="date"
                          name="targetDate"
                          value={formData.targetDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingGoal ? "Cập Nhật" : "Thêm"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
