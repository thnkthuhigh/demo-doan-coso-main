import express from "express";
import {
  getOrCreateConversation,
  getUserConversations,
  sendMessage,
  getMessages,
  markConversationAsRead,
  getSupportStaff,
  getActiveConversations,
} from "../controllers/chatController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get or create conversation
router.post("/conversations", verifyToken, getOrCreateConversation);

// Get user's conversations
router.get("/conversations", verifyToken, getUserConversations);

// Send message
router.post("/messages", verifyToken, sendMessage);

// Get messages in conversation
router.get("/conversations/:conversationId/messages", verifyToken, getMessages);

// Mark conversation as read
router.patch("/conversations/:conversationId/read", verifyToken, markConversationAsRead);

// Get support staff
router.get("/support-staff", verifyToken, getSupportStaff);

// Get active conversations (admin only)
router.get("/conversations/active", verifyToken, verifyAdmin, getActiveConversations);

export default router;
