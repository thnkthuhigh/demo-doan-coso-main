import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  MessageCircle,
  Search,
  Send,
  User,
  Clock,
  CheckCheck,
  Check,
  Circle,
} from "lucide-react";

const ChatSupportManagement = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "online"
  const messagesEndRef = useRef(null);
  const pollInterval = useRef(null);

  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 10 seconds (reduced from 5)
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      markAsRead(selectedConversation._id);
      
      // Poll for new messages every 5 seconds (reduced from 3)
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
      pollInterval.current = setInterval(() => {
        fetchMessages(selectedConversation._id);
      }, 5000);
    }

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Get conversations array from response
      const conversationsData = response.data.conversations || response.data || [];
      
      // Filter only support conversations and add online status
      const supportConversations = conversationsData
        .filter((conv) => conv.type === "support")
        .map((conv) => {
          const isOnline = conv.lastMessageTime && 
            (new Date() - new Date(conv.lastMessageTime)) < 5 * 60 * 1000; // 5 minutes
          return { ...conv, isOnline };
        });
      
      setConversations(supportConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/chat/conversations/${conversationId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Backend returns { messages: [...] }
      const messagesData = response.data.messages || response.data || [];
      
      // Ensure we set an array
      const safeMessagesData = Array.isArray(messagesData) ? messagesData : [];
      setMessages(safeMessagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]); // Set empty array on error
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/chat/conversations/${conversationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchConversations(); // Refresh to update unread count
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/chat/messages",
        {
          conversationId: selectedConversation._id,
          content: messageText,
          type: "text",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessageText("");
      fetchMessages(selectedConversation._id);
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return d.toLocaleDateString("vi-VN");
  };

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")._id;

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.participants.find((p) => p._id !== currentUserId);
    if (!otherUser) return false;
    
    // Filter by tab
    if (activeTab === "online" && !conv.isOnline) return false;
    
    // Filter by search
    const searchLower = searchTerm.toLowerCase();
    return (
      otherUser.username?.toLowerCase().includes(searchLower) ||
      otherUser.fullName?.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  const onlineCount = conversations.filter(conv => conv.isOnline).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl shadow-lg">
              <MessageCircle className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Chat & Hỗ Trợ</h1>
              <p className="text-gray-500 mt-1">
                Trả lời tin nhắn từ người dùng ({conversations.length} cuộc hội thoại)
              </p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === "all"
                  ? "bg-white text-purple-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("online")}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === "online"
                  ? "bg-white text-green-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Circle className={`w-2 h-2 ${activeTab === "online" ? "fill-current" : ""}`} />
              Đang online
              {onlineCount > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                  {onlineCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Chat Interface */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: "calc(100vh - 250px)" }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm cuộc hội thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Không có cuộc hội thoại nào</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const otherUser = conv.participants.find((p) => p._id !== currentUserId);
                  const unreadCount = conv.unreadCount?.[currentUserId] || 0;
                  const isSelected = selectedConversation?._id === conv._id;

                  return (
                    <motion.div
                      key={conv._id}
                      whileHover={{ backgroundColor: "#F9FAFB" }}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                        isSelected ? "bg-purple-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            {otherUser?.username?.[0]?.toUpperCase() || "U"}
                          </div>
                          {conv.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-800 truncate flex items-center gap-2">
                              {otherUser?.fullName || otherUser?.username || "User"}
                              {conv.isOnline && (
                                <span className="text-xs text-green-600 font-normal">● Online</span>
                              )}
                            </h3>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conv.lastMessage?.content || "Chưa có tin nhắn"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {conv.lastMessage?.createdAt
                              ? formatTime(conv.lastMessage.createdAt)
                              : ""}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold shadow-lg">
                      {selectedConversation.participants
                        .find((p) => p._id !== currentUserId)
                        ?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">
                        {selectedConversation.participants.find((p) => p._id !== currentUserId)
                          ?.fullName ||
                          selectedConversation.participants.find((p) => p._id !== currentUserId)
                            ?.username ||
                          "User"}
                      </h3>
                      <p className="text-sm text-purple-100">
                        @{selectedConversation.participants.find((p) => p._id !== currentUserId)
                          ?.username}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {safeMessages.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Chưa có tin nhắn nào</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {safeMessages.map((msg) => {
                        const isOwn = msg.sender._id === currentUserId;
                        return (
                          <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] ${
                                isOwn
                                  ? "bg-gradient-to-br from-purple-500 to-pink-600 text-white"
                                  : "bg-white text-gray-800 shadow-md"
                              } rounded-2xl px-4 py-3`}
                            >
                              {!isOwn && (
                                <p className="text-xs font-semibold text-purple-600 mb-1">
                                  {msg.sender.fullName || msg.sender.username}
                                </p>
                              )}
                              <p className="break-words">{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
                                <Clock size={12} className={isOwn ? "text-purple-200" : "text-gray-400"} />
                                <span className={`text-xs ${isOwn ? "text-purple-200" : "text-gray-400"}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {isOwn && (
                                  <>
                                    {msg.readBy && msg.readBy.length > 1 ? (
                                      <CheckCheck size={14} className="text-purple-200" />
                                    ) : (
                                      <Check size={14} className="text-purple-200" />
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                      disabled={sending}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={20} />
                      Gửi
                    </motion.button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Chọn một cuộc hội thoại để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSupportManagement;
