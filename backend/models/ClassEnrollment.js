import mongoose from "mongoose";

const classEnrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      // Giữ chỗ trong 2 ngày (48h) nếu chưa thanh toán
      default: function() {
        return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      },
      index: true,
    },
    expiresAt: {
      type: Date,
      // Giữ chỗ trong 2 ngày (48h) nếu chưa thanh toán
      default: function() {
        return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      },
      index: true, // Index để query nhanh
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "cancelled"],
      default: "active",
    },
    remainingSessions: {
      type: Number, // Số buổi còn lại của học viên
    },
    attendanceRecord: [
      {
        sessionNumber: Number,
        date: Date,
        attended: Boolean,
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Đảm bảo một user chỉ đăng ký một lần cho mỗi lớp
classEnrollmentSchema.index({ user: 1, class: 1 }, { unique: true });

export default mongoose.model("ClassEnrollment", classEnrollmentSchema);
