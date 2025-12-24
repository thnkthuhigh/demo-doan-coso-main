import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token không được cung cấp" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token received:", token);

    if (!token) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded);

    // Tìm user từ database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User không tồn tại" });
    }

    // Gán user vào req
    req.user = user;
    console.log("User attached to req:", { id: user._id, role: user.role });

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn" });
    }

    return res.status(500).json({ message: "Lỗi server khi xác thực token" });
  }
};

export const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Không có thông tin user" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ admin mới có quyền truy cập" });
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xác thực quyền admin" });
  }
};

export const verifyInstructor = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Không có thông tin user" });
    }

    if (req.user.role !== "instructor" && req.user.role !== "trainer") {
      return res
        .status(403)
        .json({ message: "Chỉ huấn luyện viên mới có quyền truy cập" });
    }

    next();
  } catch (error) {
    console.error("Instructor verification error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xác thực quyền instructor" });
  }
};

export const verifyInstructorOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Không có thông tin user" });
    }

    if (req.user.role !== "instructor" && req.user.role !== "trainer" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ huấn luyện viên hoặc admin mới có quyền truy cập" });
    }

    next();
  } catch (error) {
    console.error("Instructor/Admin verification error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xác thực quyền" });
  }
};

// Middleware to verify class ownership by instructor
export const verifyClassInstructor = async (req, res, next) => {
  try {
    const { id, classId } = req.params;
    const targetClassId = id || classId;

    console.log("🔐 verifyClassInstructor middleware:");
    console.log("   User ID:", req.user._id);
    console.log("   User Role:", req.user.role);
    console.log("   Target Class ID:", targetClassId);

    if (!targetClassId) {
      console.log("❌ No class ID found in params");
      return res.status(400).json({ message: "Không tìm thấy ID lớp học" });
    }

    // Admin có quyền truy cập tất cả
    if (req.user.role === "admin") {
      console.log("✅ Admin access granted");
      return next();
    }

    // Trainer chỉ được truy cập lớp của mình
    if (req.user.role === "trainer") {
      const Class = (await import("../models/Class.js")).default;
      const classDoc = await Class.findById(targetClassId);

      if (!classDoc) {
        console.log("❌ Class not found:", targetClassId);
        return res.status(404).json({ message: "Không tìm thấy lớp học" });
      }

      console.log("📚 Class found:", classDoc.className);
      console.log("👨‍🏫 Class instructor:", classDoc.instructor);

      if (classDoc.instructor && classDoc.instructor.toString() !== req.user._id.toString()) {
        console.log("❌ Access denied: User is not the instructor of this class");
        return res
          .status(403)
          .json({ message: "Bạn không có quyền quản lý lớp học này" });
      }

      console.log("✅ Trainer access granted");
      return next();
    }

    console.log("❌ Access denied: Invalid role");
    return res.status(403).json({ message: "Không có quyền truy cập" });
  } catch (error) {
    console.error("❌ Class instructor verification error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xác thực quyền" });
  }
};

// Thêm alias exports để backward compatibility
export const isAuthenticated = verifyToken;
export const isAdmin = verifyAdmin;
export const authenticateToken = verifyToken;
