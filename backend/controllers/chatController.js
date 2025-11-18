import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Get or create conversation between users
export const getOrCreateConversation = async (req, res) => {
  try {
    const { participantIds, type = "direct" } = req.body;
    const userId = req.user.id || req.user.userId;

    // Validate participants
    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ message: "Cần ít nhất 1 người tham gia" });
    }

    // Add current user to participants
    const allParticipants = [...new Set([userId, ...participantIds])];

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: allParticipants, $size: allParticipants.length },
      type,
    })
      .populate("participants", "username fullName avatar role")
      .populate("lastMessage");

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: allParticipants,
        type,
        title: type === "support" ? "Hỗ trợ khách hàng" : null,
      });

      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "username fullName avatar role")
        .populate("lastMessage");
    }

    res.json({ conversation });
  } catch (error) {
    console.error("Get or create conversation error:", error);
    res.status(500).json({
      message: "Lỗi khi tạo cuộc trò chuyện",
      error: error.message,
    });
  }
};

// Get user's conversations
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { limit = 20, skip = 0 } = req.query;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true,
    })
      .populate("participants", "username fullName avatar role")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username fullName avatar" },
      })
      .sort({ lastMessageTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Add unread count for current user
    const conversationsWithUnread = conversations.map((conv) => ({
      ...conv.toObject(),
      unreadCount: conv.getUnreadCount(userId),
    }));

    res.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách trò chuyện",
      error: error.message,
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = "text", attachments = [] } = req.body;
    const userId = req.user.id || req.user.userId;

    // Validate conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    // Check if user is participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Bạn không thuộc cuộc trò chuyện này" });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content,
      type,
      attachments,
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = new Date();

    // Increment unread for other participants
    for (const participantId of conversation.participants) {
      if (participantId.toString() !== userId.toString()) {
        await conversation.incrementUnread(participantId);
      }
    }

    await conversation.save();

    // Populate sender info
    await message.populate("sender", "username fullName avatar role");

    res.status(201).json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      message: "Lỗi khi gửi tin nhắn",
      error: error.message,
    });
  }
};

// Get messages in conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;
    const userId = req.user.id || req.user.userId;

    // Validate conversation and user access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Bạn không thuộc cuộc trò chuyện này" });
    }

    // Build query
    const query = {
      conversation: conversationId,
      deletedFor: { $ne: userId },
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Get messages
    const messages = await Message.find(query)
      .populate("sender", "username fullName avatar role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Mark messages as read
    const unreadMessages = messages.filter(
      (msg) => msg.sender.toString() !== userId.toString() && !msg.isReadBy(userId)
    );

    for (const msg of unreadMessages) {
      await msg.markAsRead(userId);
    }

    // Reset unread count
    await conversation.resetUnread(userId);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      message: "Lỗi khi lấy tin nhắn",
      error: error.message,
    });
  }
};

// Mark conversation as read
export const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id || req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Bạn không thuộc cuộc trò chuyện này" });
    }

    await conversation.resetUnread(userId);

    res.json({ message: "Đã đánh dấu đã đọc" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      message: "Lỗi khi đánh dấu đã đọc",
      error: error.message,
    });
  }
};

// Get support staff for chat
export const getSupportStaff = async (req, res) => {
  try {
    const supportStaff = await User.find({
      role: { $in: ["admin", "instructor"] },
    })
      .select("username fullName avatar role")
      .limit(10);

    res.json({ supportStaff });
  } catch (error) {
    console.error("Get support staff error:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách hỗ trợ",
      error: error.message,
    });
  }
};

// Get active conversations (for admin dashboard)
export const getActiveConversations = async (req, res) => {
  try {
    const { minutes = 10 } = req.query;
    const timeThreshold = new Date(Date.now() - minutes * 60 * 1000);

    // Find conversations with recent messages (support type only)
    const activeConversations = await Conversation.find({
      lastMessageTime: { $gte: timeThreshold },
      isActive: true,
      type: "support", // Only support conversations, not admin-to-admin
    })
      .populate("participants", "username fullName avatar role email")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username fullName avatar" },
      })
      .sort({ lastMessageTime: -1 })
      .limit(50);

    // Format response with additional info and remove duplicates by user
    const userConversationMap = new Map();
    
    activeConversations.forEach((conv) => {
      const nonAdminParticipants = conv.participants.filter(
        (p) => p.role !== "admin" && p.role !== "instructor"
      );
      
      const user = nonAdminParticipants[0] || conv.participants[0];
      const userId = user?._id?.toString();
      
      // Skip if no user or already have a more recent conversation for this user
      if (!userId) return;
      
      const existing = userConversationMap.get(userId);
      const convTime = new Date(conv.lastMessageTime).getTime();
      
      if (!existing || convTime > new Date(existing.lastMessageTime).getTime()) {
        userConversationMap.set(userId, {
          _id: conv._id,
          participants: conv.participants,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount,
          type: conv.type,
          title: conv.title,
          user: user,
          isOnline: (new Date() - new Date(conv.lastMessageTime)) < 5 * 60 * 1000,
        });
      }
    });
    
    const formattedConversations = Array.from(userConversationMap.values());

    res.json({ 
      conversations: formattedConversations,
      count: formattedConversations.length,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Get active conversations error:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách chat đang hoạt động",
      error: error.message,
    });
  }
};
