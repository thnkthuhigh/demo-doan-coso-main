import express from "express";
import { getDashboardStats, getDetailedStats, getUserStats, getInstructorStats } from "../controllers/statsController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", verifyToken, verifyAdmin, getDashboardStats);
router.get("/detailed", verifyToken, verifyAdmin, getDetailedStats);
router.get("/user/:userId", verifyToken, getUserStats);
router.get("/instructor/:userId", verifyToken, getInstructorStats);

export default router;