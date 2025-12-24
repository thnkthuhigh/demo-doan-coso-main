import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Edit2,
  Save,
  X,
  Camera,
} from "lucide-react";
import { toast } from "react-toastify";

const TrainerProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const currentUser = JSON.parse(userStr);

      const response = await axios.get(
        `http://localhost:5000/api/users/${currentUser._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(response.data);
      setFormData({
        fullName: response.data.fullName || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        bio: response.data.bio || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const currentUser = JSON.parse(userStr);

      const response = await axios.put(
        `http://localhost:5000/api/users/${currentUser._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Không thể cập nhật thông tin");
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl shadow-lg">
            <User className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">👤 Hồ Sơ Cá Nhân</h1>
            <p className="text-gray-600 mt-1">Quản lý thông tin cá nhân của bạn</p>
          </div>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Edit2 className="h-5 w-5" />
            <span>Chỉnh sửa</span>
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <Save className="h-5 w-5" />
              <span>Lưu</span>
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  fullName: user.fullName || "",
                  email: user.email || "",
                  phone: user.phone || "",
                  bio: user.bio || "",
                });
              }}
              className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
              <span>Hủy</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  {user?.fullName?.charAt(0) || "T"}
                </div>
                {editing && (
                  <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                    <Camera className="h-5 w-5 text-gray-600" />
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {user?.fullName}
              </h2>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                <Award className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-sm font-semibold text-purple-700">
                  Huấn Luyện Viên
                </span>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Tham gia: {new Date(user?.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Thông Tin Chi Tiết
            </h3>
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <User className="h-4 w-4 mr-2 text-indigo-600" />
                  Họ và Tên
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800 text-lg">{user?.fullName}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="h-4 w-4 mr-2 text-indigo-600" />
                  Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled
                  />
                ) : (
                  <p className="text-gray-800 text-lg">{user?.email}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="h-4 w-4 mr-2 text-indigo-600" />
                  Số Điện Thoại
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800 text-lg">
                    {user?.phone || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Award className="h-4 w-4 mr-2 text-indigo-600" />
                  Giới Thiệu
                </label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Viết vài dòng giới thiệu về bạn..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800 text-lg whitespace-pre-wrap">
                    {user?.bio || "Chưa có giới thiệu"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-1">
                Tổng Lớp Đã Dạy
              </p>
              <p className="text-3xl font-bold text-blue-700">-</p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-semibold mb-1">
                Tổng Học Viên
              </p>
              <p className="text-3xl font-bold text-green-700">-</p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-semibold mb-1">
                Đánh Giá Trung Bình
              </p>
              <p className="text-3xl font-bold text-purple-700">-</p>
            </div>
            <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrainerProfile;
