import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Bell, CheckCircle, Info, AlertCircle, X } from "lucide-react";
import { toast } from "react-toastify";

const TrainerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications(notifications.filter((n) => n._id !== notificationId));
      toast.success("Đã xóa thông báo");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Không thể xóa thông báo");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "info":
        return <Info className="h-6 w-6 text-blue-600" />;
      case "warning":
        return <AlertCircle className="h-6 w-6 text-orange-600" />;
      default:
        return <Bell className="h-6 w-6 text-gray-600" />;
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
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-4 rounded-xl shadow-lg">
          <Bell className="text-white" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🔔 Thông Báo</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi các thông báo quan trọng
          </p>
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-lg p-6 ${
                !notification.read ? "border-l-4 border-indigo-600" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div>{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        !notification.read ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Không có thông báo mới
          </h3>
          <p className="text-gray-500">Bạn đã xem hết tất cả thông báo</p>
        </div>
      )}
    </div>
  );
};

export default TrainerNotifications;
