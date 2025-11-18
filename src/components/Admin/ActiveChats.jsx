import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  MessageCircle,
  Users,
  Clock,
  Circle,
  User,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActiveChats = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeWindow, setTimeWindow] = useState(10); // minutes
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveChats();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchActiveChats, 15000);
    
    return () => clearInterval(interval);
  }, [timeWindow]);

  const fetchActiveChats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/chat/conversations/active?minutes=${timeWindow}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setActiveChats(response.data.conversations);
      setError(null);
    } catch (error) {
      console.error("Error fetching active chats:", error);
      setError(error.response?.data?.message || "Không thể tải danh sách chat");
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (conversation) => {
    navigate("/admin/chat-support");
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat Đang Hoạt Động</h1>
            <p className="text-gray-600">
              Theo dõi người dùng đang chat với admin
            </p>
          </div>
        </div>

        {/* Time Window Selector */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
          <Clock className="w-5 h-5 text-gray-500" />
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="bg-transparent border-none outline-none font-medium text-gray-700"
          >
            <option value={5}>5 phút</option>
            <option value={10}>10 phút</option>
            <option value={15}>15 phút</option>
            <option value={30}>30 phút</option>
            <option value={60}>1 giờ</option>
          </select>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Tổng Chat</p>
              <p className="text-3xl font-bold mt-1">{activeChats.length}</p>
            </div>
            <MessageCircle className="w-12 h-12 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Đang Online</p>
              <p className="text-3xl font-bold mt-1">
                {activeChats.filter((chat) => chat.isOnline).length}
              </p>
            </div>
            <Circle className="w-12 h-12 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Người Dùng</p>
              <p className="text-3xl font-bold mt-1">
                {new Set(activeChats.map((chat) => chat.user?._id)).size}
              </p>
            </div>
            <Users className="w-12 h-12 opacity-20" />
          </div>
        </motion.div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Active Chats List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Danh Sách Chat ({activeChats.length})
          </h2>
        </div>

        {activeChats.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              Không có chat nào đang hoạt động
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Chưa có người dùng nào chat trong {timeWindow} phút qua
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activeChats.map((chat, index) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleChatClick(chat)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-all duration-200 flex items-start gap-4"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {chat.user?.avatar ? (
                    <img
                      src={chat.user.avatar}
                      alt={chat.user.fullName || chat.user.username}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center border-2 border-gray-200">
                      <User className="w-7 h-7 text-white" />
                    </div>
                  )}
                  
                  {/* Online Indicator */}
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {chat.user?.fullName || chat.user?.username || "Người dùng"}
                      </h3>
                      {chat.user?.email && (
                        <p className="text-sm text-gray-500">{chat.user.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {formatTime(chat.lastMessageTime)}
                    </div>
                  </div>

                  {/* Last Message */}
                  {chat.lastMessage && (
                    <div className="mt-2">
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium text-gray-700">
                          {chat.lastMessage.sender?.fullName || "User"}:
                        </span>{" "}
                        {truncateText(chat.lastMessage.message)}
                      </p>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mt-3">
                    {chat.isOnline ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <Circle className="w-2 h-2 fill-current" />
                        Đang online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        <Circle className="w-2 h-2 fill-current" />
                        Offline
                      </span>
                    )}
                    
                    {chat.unreadCount > 0 && (
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                        {chat.unreadCount} tin mới
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-sm text-gray-500">
        <p>Tự động cập nhật mỗi 15 giây</p>
      </div>
    </div>
  );
};

export default ActiveChats;
