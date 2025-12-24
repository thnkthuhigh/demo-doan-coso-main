import express from "express";
import {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  enrollClass,
  getClassMembers,
  getUserClasses,
  deleteEnrollment,
  getClassById,
  getClassDetails,
} from "../controllers/classController.js";
import { 
  verifyToken, 
  verifyAdmin, 
  verifyInstructor,
  verifyInstructorOrAdmin,
  verifyClassInstructor 
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log("=== DEBUG REQUEST ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("User:", req.user);
  console.log("====================");
  next();
};

// Public routes (đặt specific routes trước dynamic routes)
router.get("/", getAllClasses);

// Instructor routes - get classes assigned to instructor
router.get("/instructor/my-classes", verifyToken, verifyInstructor, async (req, res) => {
  try {
    const ClassModel = (await import("../models/Class.js")).default;
    const classes = await ClassModel.find({ instructor: req.user._id })
      .populate("service", "name image")
      .populate("instructor", "fullName email")
      .sort({ startDate: -1 });
    
    res.json(classes);
  } catch (error) {
    console.error("Error fetching instructor classes:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách lớp" });
  }
});

// Get classes by instructor ID (for trainer dashboard)
router.get("/instructor/:instructorId", verifyToken, async (req, res) => {
  try {
    const { instructorId } = req.params;
    const ClassModel = (await import("../models/Class.js")).default;
    
    // Check if user is accessing their own classes or is admin
    if (req.user._id.toString() !== instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    
    const classes = await ClassModel.find({ instructor: instructorId })
      .populate("service", "name image")
      .populate("instructor", "fullName email")
      .sort({ startDate: -1 });
    
    console.log(`Found ${classes.length} classes for instructor ${instructorId}`);
    res.json(classes);
  } catch (error) {
    console.error("Error fetching instructor classes by ID:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách lớp" });
  }
});

// User routes
router.post("/enroll", debugMiddleware, verifyToken, enrollClass);
router.get("/user/:userId", verifyToken, getUserClasses);
router.delete("/enrollment/:enrollmentId", verifyToken, deleteEnrollment);

// Admin routes - only admin can create/delete classes
router.post("/", verifyToken, verifyAdmin, createClass);
router.delete("/:id", verifyToken, verifyAdmin, deleteClass);

// Instructor or Admin routes - can update class and view members
router.put("/:id", verifyToken, verifyClassInstructor, updateClass);
router.get("/:classId/members", verifyToken, verifyClassInstructor, getClassMembers);

// Get enrollments for attendance management
router.get("/:classId/enrollments", verifyToken, verifyClassInstructor, async (req, res) => {
  try {
    const { classId } = req.params;
    console.log("📋 Fetching enrollments for class:", classId);
    console.log("👤 Requested by user:", req.user._id, "Role:", req.user.role);
    
    const ClassEnrollment = (await import("../models/ClassEnrollment.js")).default;
    const Attendance = (await import("../models/Attendance.js")).default;

    const enrollments = await ClassEnrollment.find({ 
      class: classId, // Field name is 'class' not 'classId'
      paymentStatus: true // Boolean true, not string 'paid'
    })
      .populate('user', 'fullName email') // Field name is 'user' not 'userId'
      .select('_id user createdAt');

    console.log("📊 Found enrollments:", enrollments.length);
    if (enrollments.length > 0) {
      console.log("👤 First enrollment user:", enrollments[0].user);
    }

    // Get attendance records for each enrollment
    const enrollmentsWithAttendance = await Promise.all(
      enrollments.map(async (enrollment) => {
        const attendances = await Attendance.find({
          classId: classId,
          userId: enrollment.user._id
        }).select('sessionDate sessionNumber isPresent isLocked checkinTime date status');

        return {
          _id: enrollment._id,
          user: enrollment.user, // Already populated from 'user' field
          userId: enrollment.user, // Keep userId for backward compatibility
          attendanceRecords: attendances,
          createdAt: enrollment.createdAt,
        };
      })
    );

    console.log("✅ Returning", enrollmentsWithAttendance.length, "enrollments with attendance");
    console.log("👤 Sample enrollment:", enrollmentsWithAttendance[0]);
    
    res.json(enrollmentsWithAttendance);
  } catch (error) {
    console.error("❌ Error fetching class enrollments:", error);
    res.status(500).json({ 
      message: "Lỗi khi lấy danh sách học viên",
      error: error.message 
    });
  }
});

// Dynamic routes (đặt cuối cùng)
router.get("/:id/details", getClassDetails);
router.get("/:id", getClassById);

export default router;
