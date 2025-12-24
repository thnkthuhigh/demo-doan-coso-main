import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Weight,
  Ruler,
  Target,
  Heart,
  Zap,
  Droplet,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function BodyMetrics() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [latestMetrics, setLatestMetrics] = useState(null);

  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    bodyFat: "",
    muscleMass: "",
    waist: "",
    chest: "",
    hips: "",
    notes: "",
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData._id) {
      toast.error("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }
    setUser(userData);
    fetchMetrics(userData._id);
    fetchLatestMetrics(userData._id);
  }, [navigate]);

  const fetchMetrics = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/body-metrics/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMetrics(response.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error("Error fetching metrics:", error);
      if (error.response?.status !== 404) {
        toast.error("Không thể tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestMetrics = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/body-metrics/latest/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLatestMetrics(response.data);
    } catch (error) {
      console.error("Error fetching latest metrics:", error);
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

    // Validate
    if (!formData.weight || !formData.height) {
      toast.error("Vui lòng nhập cân nặng và chiều cao");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const dataToSend = {
        ...formData,
        userId: user._id,
        date: new Date().toISOString(),
      };

      if (editingMetric) {
        await axios.put(
          `http://localhost:5000/api/body-metrics/${editingMetric._id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("✅ Cập nhật thành công!");
      } else {
        await axios.post(
          "http://localhost:5000/api/body-metrics",
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("✅ Thêm số đo thành công!");
      }

      resetForm();
      fetchMetrics(user._id);
      fetchLatestMetrics(user._id);
    } catch (error) {
      console.error("Error saving metrics:", error);
      toast.error("Lỗi khi lưu dữ liệu");
    }
  };

  const handleEdit = (metric) => {
    setEditingMetric(metric);
    setFormData({
      weight: metric.weight || "",
      height: metric.height || "",
      bodyFat: metric.bodyFat || "",
      muscleMass: metric.muscleMass || "",
      waist: metric.waist || "",
      chest: metric.chest || "",
      hips: metric.hips || "",
      notes: metric.notes || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa số đo này?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/body-metrics/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Đã xóa");
      fetchMetrics(user._id);
      fetchLatestMetrics(user._id);
    } catch (error) {
      console.error("Error deleting metric:", error);
      toast.error("Lỗi khi xóa");
    }
  };

  const resetForm = () => {
    setFormData({
      weight: "",
      height: "",
      bodyFat: "",
      muscleMass: "",
      waist: "",
      chest: "",
      hips: "",
      notes: "",
    });
    setEditingMetric(null);
    setShowAddModal(false);
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInM = height / 100;
    return (weight / (heightInM * heightInM)).toFixed(1);
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { text: "Thiếu cân", color: "text-yellow-600" };
    if (bmi < 25) return { text: "Bình thường", color: "text-green-600" };
    if (bmi < 30) return { text: "Thừa cân", color: "text-orange-600" };
    return { text: "Béo phì", color: "text-red-600" };
  };

  const getProgress = (current, previous, metric) => {
    if (!previous || !current) return null;
    const diff = current - previous;
    const isGood =
      metric === "bodyFat" || metric === "waist" ? diff < 0 : diff > 0;
    return { diff, isGood };
  };

  // Prepare chart data
  const chartData = metrics
    .slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      weight: m.weight,
      bodyFat: m.bodyFat,
      muscleMass: m.muscleMass,
    }));

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
              Số Đo Cơ Thể
            </h1>
            <p className="text-gray-600">Theo dõi tiến trình của bạn</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm Số Đo
          </button>
        </div>

        {/* Latest Stats Cards */}
        {latestMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Weight className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Cân nặng</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestMetrics.weight} kg
              </p>
              {metrics.length > 1 && (
                <p className="text-xs text-gray-500 mt-1">
                  BMI: {calculateBMI(latestMetrics.weight, latestMetrics.height)}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Ruler className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Chiều cao</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestMetrics.height} cm
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Droplet className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Mỡ cơ thể</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestMetrics.bodyFat || "N/A"}
                {latestMetrics.bodyFat && "%"}
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
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Cơ bắp</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestMetrics.muscleMass || "N/A"}
                {latestMetrics.muscleMass && " kg"}
              </p>
            </motion.div>
          </div>
        )}

        {/* Charts */}
        {metrics.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Biểu Đồ Tiến Trình
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3B82F6"
                  name="Cân nặng (kg)"
                  strokeWidth={2}
                />
                {chartData[0]?.bodyFat && (
                  <Line
                    type="monotone"
                    dataKey="bodyFat"
                    stroke="#F97316"
                    name="Mỡ (%)"
                    strokeWidth={2}
                  />
                )}
                {chartData[0]?.muscleMass && (
                  <Line
                    type="monotone"
                    dataKey="muscleMass"
                    stroke="#8B5CF6"
                    name="Cơ bắp (kg)"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Metrics History */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Lịch Sử Đo Lường
            </h2>
          </div>

          {metrics.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có số đo nào
              </h3>
              <p className="text-gray-500 mb-4">
                Bắt đầu theo dõi số đo cơ thể của bạn
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm Số Đo Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {metrics.map((metric, index) => {
                const bmi = calculateBMI(metric.weight, metric.height);
                const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null;

                return (
                  <motion.div
                    key={metric._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(metric.date).toLocaleDateString("vi-VN")}
                          </span>
                          {index === 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Mới nhất
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">Cân nặng</p>
                            <p className="text-sm font-semibold">
                              {metric.weight} kg
                            </p>
                          </div>
                          {metric.bodyFat && (
                            <div>
                              <p className="text-xs text-gray-500">Mỡ</p>
                              <p className="text-sm font-semibold">
                                {metric.bodyFat}%
                              </p>
                            </div>
                          )}
                          {metric.muscleMass && (
                            <div>
                              <p className="text-xs text-gray-500">Cơ bắp</p>
                              <p className="text-sm font-semibold">
                                {metric.muscleMass} kg
                              </p>
                            </div>
                          )}
                          {bmi && (
                            <div>
                              <p className="text-xs text-gray-500">BMI</p>
                              <p className={`text-sm font-semibold ${bmiStatus.color}`}>
                                {bmi} - {bmiStatus.text}
                              </p>
                            </div>
                          )}
                        </div>

                        {metric.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            {metric.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(metric)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(metric._id)}
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
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="px-6 py-4 border-b">
                  <h3 className="text-xl font-semibold">
                    {editingMetric ? "Cập Nhật Số Đo" : "Thêm Số Đo Mới"}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cân nặng (kg) *
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chiều cao (cm) *
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mỡ cơ thể (%)
                      </label>
                      <input
                        type="number"
                        name="bodyFat"
                        value={formData.bodyFat}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Khối lượng cơ (kg)
                      </label>
                      <input
                        type="number"
                        name="muscleMass"
                        value={formData.muscleMass}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vòng eo (cm)
                      </label>
                      <input
                        type="number"
                        name="waist"
                        value={formData.waist}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vòng ngực (cm)
                      </label>
                      <input
                        type="number"
                        name="chest"
                        value={formData.chest}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vòng mông (cm)
                      </label>
                      <input
                        type="number"
                        name="hips"
                        value={formData.hips}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Thêm ghi chú về chế độ ăn, tập luyện..."
                    />
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
                      {editingMetric ? "Cập Nhật" : "Thêm"}
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
