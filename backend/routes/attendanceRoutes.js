import express from "express";
import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import {
  createSession,
  markAttendance,
  getSessionAttendance,
  getClassReport,
  getClassSessions,
  updateClassSession,
  getPaidStudentsCount,
  qrCheckIn,
} from "../controllers/attendanceController.js";
import { 
  verifyToken, 
  verifyInstructorOrAdmin,
  verifyClassInstructor 
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Tạo buổi học mới - chỉ instructor/admin
router.post("/session", verifyToken, verifyInstructorOrAdmin, createSession);

// Cập nhật session hiện tại của lớp - chỉ instructor của lớp hoặc admin
router.put("/class/:classId/session", verifyToken, verifyClassInstructor, updateClassSession);

// Điểm danh học viên - chỉ instructor của lớp hoặc admin
router.post("/mark", verifyToken, verifyInstructorOrAdmin, markAttendance);

// Lấy danh sách điểm danh của một buổi học - instructor của lớp hoặc admin
router.get(
  "/session/:classId/:sessionNumber",
  verifyToken,
  verifyClassInstructor,
  getSessionAttendance
);

// Lấy tất cả attendance records của lớp - instructor của lớp hoặc admin
router.get("/class/:classId", verifyToken, verifyClassInstructor, async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Lấy tất cả attendance records của lớp
    const attendanceRecords = await Attendance.find({ classId })
      .populate('userId', 'fullName username email')
      .sort({ sessionNumber: 1, sessionDate: 1 });
    
    // Đảm bảo các records có field isLocked (mặc định false nếu chưa có)
    const recordsWithDefaults = attendanceRecords.map(record => {
      const recordObj = record.toObject();
      if (recordObj.isLocked === undefined) {
        recordObj.isLocked = false;
      }
      if (recordObj.markedAt === undefined) {
        recordObj.markedAt = null;
      }
      return recordObj;
    });
    
    res.json(recordsWithDefaults);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu điểm danh', error: error.message });
  }
});

// Lấy báo cáo điểm danh của lớp - instructor của lớp hoặc admin
router.get("/class/:classId/report", verifyToken, verifyClassInstructor, getClassReport);

// Lấy danh sách sessions - instructor của lớp hoặc admin
router.get("/class/:classId/sessions", verifyToken, verifyClassInstructor, getClassSessions);

// Số lượng học viên đã thanh toán - instructor của lớp hoặc admin
router.get("/class/:classId/paid-students", verifyToken, verifyClassInstructor, getPaidStudentsCount);

// QR Code check-in route - user tự check-in
router.post("/qr-checkin", verifyToken, qrCheckIn);

// Cập nhật trạng thái điểm danh - instructor hoặc admin
router.put("/:attendanceId", verifyToken, verifyInstructorOrAdmin, async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { isPresent } = req.body;

    console.log("=== UPDATE ATTENDANCE ===");
    console.log("Attendance ID:", attendanceId);
    console.log("New status:", isPresent);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return res.status(400).json({ message: "ID điểm danh không hợp lệ" });
    }

    // Tìm và cập nhật attendance record
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi điểm danh" });
    }

    // Cập nhật trạng thái (cho phép sửa cả records đã locked từ màn Chi tiết)
    attendance.isPresent = isPresent;
    if (isPresent && !attendance.checkinTime) {
      attendance.checkinTime = new Date();
    }
    
    await attendance.save();

    console.log("✅ Attendance updated successfully");
    res.json({ message: "Cập nhật điểm danh thành công", attendance });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật điểm danh", error: error.message });
  }
});

// Khóa điểm danh cho buổi học (sau khi hoàn thành) - instructor hoặc admin
router.post("/lock-session", verifyToken, verifyInstructorOrAdmin, async (req, res) => {
  try {
    const { classId, sessionDate } = req.body;

    console.log("=== LOCK ATTENDANCE SESSION ===");
    console.log("Class ID:", classId);
    console.log("Session Date:", sessionDate);

    if (!classId || !sessionDate) {
      return res.status(400).json({ message: "Thiếu thông tin classId hoặc sessionDate" });
    }

    // Parse date
    const dateStr = sessionDate.split('T')[0];

    // Tìm tất cả attendance records cho buổi học này
    const attendances = await Attendance.find({ classId });
    
    // Filter theo date
    const sessionAttendances = attendances.filter(att => {
      const attDate = att.sessionDate.toISOString().split('T')[0];
      return attDate === dateStr;
    });

    if (sessionAttendances.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi điểm danh cho buổi học này" });
    }

    // Khóa tất cả attendance records và set thời điểm điểm danh
    const now = new Date();
    const updatePromises = sessionAttendances.map(att => {
      // Cập nhật cả khi field chưa tồn tại
      return Attendance.findByIdAndUpdate(
        att._id, 
        { 
          $set: {
            isLocked: true,
            markedAt: att.markedAt || now
          }
        },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    console.log(`✅ Locked ${sessionAttendances.length} attendance records`);
    res.json({ 
      message: "Đã khóa điểm danh thành công", 
      count: sessionAttendances.length,
      locked: true
    });
  } catch (error) {
    console.error("Error locking attendance session:", error);
    res.status(500).json({ message: "Lỗi khi khóa điểm danh", error: error.message });
  }
});

// Route tạm thời để reset
router.delete("/force-reset", verifyToken, async (req, res) => {
  try {
    console.log("🗑️ Dropping attendances collection...");
    await mongoose.connection.db.collection("attendances").drop();
    console.log("✅ Collection dropped successfully");
    res.json({ message: "Đã reset toàn bộ attendance collection và indexes" });
  } catch (error) {
    console.error("Error resetting collection:", error);
    if (error.message.includes("ns not found")) {
      res.json({ message: "Collection không tồn tại hoặc đã được xóa" });
    } else {
      res
        .status(500)
        .json({ message: "Lỗi khi reset collection", error: error.message });
    }
  }
});

// Route tạm thời để add isLocked field
router.post("/add-locked-field", verifyToken, async (req, res) => {
  try {
    console.log("🔧 Adding isLocked field to all attendance records...");
    
    const result = await Attendance.updateMany(
      { isLocked: { $exists: false } },
      { 
        $set: { 
          isLocked: false,
          markedAt: null
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} records`);
    res.json({ 
      message: `Đã thêm field isLocked cho ${result.modifiedCount} records`,
      modified: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error adding field:", error);
    res.status(500).json({ message: "Lỗi khi thêm field", error: error.message });
  }
});

// Get user attendance report
router.get("/user/:userId/report", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra quyền truy cập
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Bạn không có quyền xem thông tin này",
      });
    }

    // Tạm thời trả về dữ liệu rỗng
    res.json({
      attendanceRecords: [],
      stats: {
        totalSessions: 0,
        attendedSessions: 0,
        missedSessions: 0,
        attendanceRate: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy báo cáo điểm danh",
    });
  }
});

// Mark attendance in batch - instructor only
router.post("/mark-batch", verifyToken, verifyInstructorOrAdmin, async (req, res) => {
  try {
    console.log("=== MARK BATCH ATTENDANCE REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("User:", req.user);
    
    const { attendances } = req.body; // Array of {classId, enrollmentId, date, status}

    if (!Array.isArray(attendances) || attendances.length === 0) {
      console.log("Invalid attendances data");
      return res.status(400).json({ message: "Dữ liệu điểm danh không hợp lệ" });
    }

    console.log(`Processing ${attendances.length} attendance records...`);
    const results = [];
    for (const att of attendances) {
      const { classId, enrollmentId, date, status } = att;
      
      console.log(`Processing enrollment: ${enrollmentId}`);
      
      // Find enrollment
      const enrollment = await ClassEnrollment.findById(enrollmentId).populate('class user');
      if (!enrollment) {
        console.log(`Enrollment not found: ${enrollmentId}`);
        results.push({ enrollmentId, success: false, message: "Không tìm thấy đăng ký" });
        continue;
      }

      console.log(`Found enrollment for user: ${enrollment.user?._id}`);

      // Update or create attendance
      const attendance = await Attendance.findOneAndUpdate(
        {
          classId: new mongoose.Types.ObjectId(classId),
          enrollmentId: new mongoose.Types.ObjectId(enrollmentId),
          date: new Date(date),
        },
        {
          status,
          markedBy: req.user.id,
        },
        { upsert: true, new: true }
      );

      console.log(`Attendance saved for ${enrollmentId}`);
      results.push({ enrollmentId, success: true, attendance });
    }

    console.log(`Batch complete: ${results.filter(r => r.success).length}/${attendances.length} successful`);

    res.json({
      message: `Đã lưu ${results.filter(r => r.success).length}/${attendances.length} điểm danh`,
      results,
    });
  } catch (error) {
    console.error("Error marking batch attendance:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Lỗi khi lưu điểm danh",
      error: error.message 
    });
  }
});

// Get my attendance history (student) - all classes
router.get("/my-history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📍 Fetching attendance history for user:', userId);

    // Lấy tất cả attendance records của user này
    const attendances = await Attendance.find({ userId })
      .populate({
        path: 'classId',
        select: 'className instructor',
        populate: { path: 'instructor', select: 'fullName' }
      })
      .sort({ sessionDate: -1 });

    console.log('✅ Found', attendances.length, 'attendance records');

    const history = attendances.map(att => ({
      _id: att._id,
      date: att.sessionDate || att.date,
      status: att.isPresent ? 'present' : 'absent',
      classInfo: att.classId ? {
        _id: att.classId._id,
        name: att.classId.className,
        instructor: att.classId.instructor?.fullName || 'Chưa có HLV',
      } : null,
    }));

    res.json(history);
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ message: "Lỗi khi tải lịch sử điểm danh" });
  }
});

// Get my attendance history (student) - specific class
router.get("/my-history/:classId", verifyToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;

    console.log('📍 Fetching attendance history for user:', userId, 'class:', classId);

    // Lấy tất cả sessions đã được tạo cho lớp này (bất kể user nào)
    const allSessions = await Attendance.find({ classId })
      .select('sessionNumber sessionDate')
      .sort({ sessionNumber: 1 })
      .lean();

    // Lấy danh sách session numbers unique
    const uniqueSessions = [...new Map(
      allSessions.map(item => [item.sessionNumber, item])
    ).values()];

    console.log('📊 Total sessions created by trainer:', uniqueSessions.length);

    // Lấy attendance records của user này
    const userAttendances = await Attendance.find({ userId, classId })
      .select('_id sessionDate sessionNumber isPresent')
      .sort({ sessionNumber: 1 })
      .lean();

    console.log('✅ User attendance records:', userAttendances.length);

    // Lấy thông tin lớp
    const classData = await mongoose.model('Class').findById(classId)
      .select('className instructor')
      .populate('instructor', 'fullName')
      .lean();

    // Map để dễ tra cứu
    const userAttendanceMap = new Map(
      userAttendances.map(a => [a.sessionNumber, a])
    );

    // Tạo history với TẤT CẢ sessions đã được HLV tạo
    const history = uniqueSessions.map(session => {
      const userRecord = userAttendanceMap.get(session.sessionNumber);
      
      if (userRecord) {
        // User có attendance record cho buổi này
        return {
          _id: userRecord._id,
          date: userRecord.sessionDate,
          sessionNumber: session.sessionNumber,
          status: userRecord.isPresent ? 'present' : 'absent',
          classInfo: classData ? {
            _id: classData._id,
            name: classData.className,
            instructor: classData.instructor?.fullName || 'Chưa có HLV',
          } : null,
        };
      } else {
        // HLV đã tạo buổi này nhưng user không có record → vắng
        return {
          _id: `missing-${session.sessionNumber}`,
          date: session.sessionDate,
          sessionNumber: session.sessionNumber,
          status: 'absent',
          classInfo: classData ? {
            _id: classData._id,
            name: classData.className,
            instructor: classData.instructor?.fullName || 'Chưa có HLV',
          } : null,
        };
      }
    });

    console.log('📋 Final history with', history.length, 'sessions');

    res.json({
      attendance: history,
      totalSessions: 12, // Standard total
    });
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ message: "Lỗi khi tải lịch sử điểm danh" });
  }
});

export default router;
