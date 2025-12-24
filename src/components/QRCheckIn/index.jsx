import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Loader,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function QRCheckIn() {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);
  const [user, setUser] = useState(null);
  const [userClasses, setUserClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData._id) {
      toast.error("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }
    setUser(userData);
    fetchUserClasses(userData._id);
  }, [navigate]);

  const fetchUserClasses = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/classes/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Chỉ lấy các lớp đã thanh toán và đang active
      const activeClasses = response.data.filter(
        (enrollment) =>
          enrollment.paymentStatus &&
          (enrollment.class?.status === "ongoing" ||
            enrollment.class?.status === "upcoming")
      );

      setUserClasses(activeClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Không thể tải danh sách lớp học");
    }
  };

  const handleQRInput = (e) => {
    setQrCode(e.target.value);
    setCheckInResult(null);
  };

  const handleManualCheckIn = async () => {
    if (!qrCode.trim()) {
      toast.error("Vui lòng nhập mã QR");
      return;
    }

    if (!selectedClass) {
      toast.error("Vui lòng chọn lớp học");
      return;
    }

    await performCheckIn(qrCode, selectedClass);
  };

  const performCheckIn = async (qrCodeValue, classId) => {
    setLoading(true);
    setCheckInResult(null);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/attendance/qr-checkin",
        {
          userId: user._id,
          classId: classId,
          qrCode: qrCodeValue,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCheckInResult({
        success: true,
        message: response.data.message || "Điểm danh thành công!",
        data: response.data.attendance,
      });

      toast.success("✅ Điểm danh thành công!");

      // Reset form sau 3 giây
      setTimeout(() => {
        setQrCode("");
        setSelectedClass("");
        setCheckInResult(null);
      }, 3000);
    } catch (error) {
      console.error("Check-in error:", error);

      const errorMessage =
        error.response?.data?.message || "Điểm danh thất bại";

      setCheckInResult({
        success: false,
        message: errorMessage,
      });

      toast.error("❌ " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteQR = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setQrCode(text);
      toast.info("Đã dán mã QR từ clipboard");
    } catch (error) {
      toast.error("Không thể đọc clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <QrCode className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Điểm Danh QR Code
          </h1>
          <p className="text-gray-600">
            Quét hoặc nhập mã QR để điểm danh vào lớp học
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Class Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn lớp học
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">-- Chọn lớp học --</option>
              {userClasses.map((enrollment) => (
                <option key={enrollment._id} value={enrollment.class._id}>
                  {enrollment.class.name || enrollment.class.className} -{" "}
                  {enrollment.class.instructor?.fullName ||
                    enrollment.class.instructorName ||
                    "N/A"}
                </option>
              ))}
            </select>
          </div>

          {/* QR Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã QR Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={qrCode}
                onChange={handleQRInput}
                placeholder="Nhập hoặc dán mã QR..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={handlePasteQR}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                disabled={loading}
              >
                Dán
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Yêu cầu HLV cung cấp mã QR của buổi học
            </p>
          </div>

          {/* Check-in Button */}
          <button
            onClick={handleManualCheckIn}
            disabled={loading || !qrCode || !selectedClass}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
              loading || !qrCode || !selectedClass
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin mr-2" />
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CheckCircle className="mr-2" />
                Điểm Danh
              </span>
            )}
          </button>

          {/* Result Message */}
          {checkInResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-6 p-4 rounded-lg ${
                checkInResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start">
                {checkInResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 mr-3" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 mt-0.5 mr-3" />
                )}
                <div className="flex-1">
                  <h3
                    className={`font-semibold mb-1 ${
                      checkInResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {checkInResult.success ? "Thành công!" : "Thất bại!"}
                  </h3>
                  <p
                    className={`text-sm ${
                      checkInResult.success ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {checkInResult.message}
                  </p>
                  {checkInResult.data && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        Buổi học: {checkInResult.data.sessionNumber || "N/A"}
                      </p>
                      <p>
                        Thời gian:{" "}
                        {new Date(
                          checkInResult.data.sessionDate ||
                            checkInResult.data.markedAt
                        ).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-4 shadow"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Camera className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lớp học</p>
                <p className="text-lg font-semibold text-gray-900">
                  {userClasses.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-4 shadow"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Học viên</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.username || "N/A"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-4 shadow"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hôm nay</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 rounded-lg p-6"
        >
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Hướng dẫn sử dụng
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>Chọn lớp học bạn muốn điểm danh</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>
                Yêu cầu HLV hiển thị mã QR của buổi học (hoặc gửi mã cho bạn)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>Nhập hoặc dán mã QR vào ô trên</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>
                Nhấn "Điểm Danh" - hệ thống sẽ xác nhận tự động
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">⚠️</span>
              <span>Lưu ý: Chỉ điểm danh được trong giờ học</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
