import User from "../models/User.js";
import Class from "../models/Class.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import Service from "../models/Service.js";
import Club from "../models/Club.js";
import Attendance from "../models/Attendance.js";
import Payment from "../models/Payment.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Tổng số người dùng
    const totalUsers = await User.countDocuments({ role: "user" });
    
    // Tính người dùng mới trong tháng này
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newUsersThisMonth = await User.countDocuments({
      role: "user",
      createdAt: { $gte: startOfMonth }
    });

    // Tổng số lớp học đang hoạt động
    const activeClasses = await Class.countDocuments({
      status: { $in: ["ongoing", "upcoming"] }
    });

    // Tính doanh thu tháng này từ các enrollment đã thanh toán
    const revenueEnrollments = await ClassEnrollment.find({
      paymentStatus: true,
      enrollmentDate: { $gte: startOfMonth }
    }).populate('class', 'price');

    const monthlyRevenue = revenueEnrollments.reduce((total, enrollment) => {
      return total + (enrollment.class?.price || 0);
    }, 0);

    // Số thành viên mới đăng ký lớp trong tháng
    const newMembersThisMonth = await ClassEnrollment.countDocuments({
      enrollmentDate: { $gte: startOfMonth }
    });

    // Thống kê theo ngày trong 7 ngày qua để vẽ chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dailyEnrollments = await ClassEnrollment.countDocuments({
        enrollmentDate: { $gte: date, $lt: nextDay }
      });

      const dailyRevenue = await ClassEnrollment.find({
        paymentStatus: true,
        enrollmentDate: { $gte: date, $lt: nextDay }
      }).populate('class', 'price');

      const revenue = dailyRevenue.reduce((total, enrollment) => {
        return total + (enrollment.class?.price || 0);
      }, 0);

      last7Days.push({
        date: date.toISOString().split('T')[0],
        enrollments: dailyEnrollments,
        revenue: revenue
      });
    }

    // Top 5 dịch vụ phổ biến nhất
    const popularServices = await ClassEnrollment.aggregate([
      {
        $lookup: {
          from: "classes",
          localField: "class",
          foreignField: "_id",
          as: "classInfo"
        }
      },
      { $unwind: "$classInfo" },
      {
        $group: {
          _id: "$classInfo.serviceName",
          count: { $sum: 1 },
          revenue: { $sum: "$classInfo.price" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Thống kê điểm danh
    const totalSessions = await Attendance.countDocuments();
    const presentSessions = await Attendance.countDocuments({ isPresent: true });
    const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions * 100).toFixed(1) : 0;

    // Hoạt động gần đây
    const recentActivities = await ClassEnrollment.find()
      .populate('user', 'username')
      .populate('class', 'className price')
      .sort({ enrollmentDate: -1 })
      .limit(10);

    const recentClasses = await Class.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('className serviceName createdAt');

    res.json({
      stats: {
        totalUsers,
        newUsersThisMonth,
        activeClasses,
        monthlyRevenue,
        newMembersThisMonth,
        attendanceRate
      },
      charts: {
        last7Days,
        popularServices
      },
      recentActivities: {
        enrollments: recentActivities,
        classes: recentClasses
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê dashboard" });
  }
};

export const getDetailedStats = async (req, res) => {
  try {
    // Thống kê chi tiết cho trang stats
    const currentYear = new Date().getFullYear();
    
    // Doanh thu theo tháng trong năm
    const monthlyRevenueStats = [];
    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(currentYear, month, 1);
      const endOfMonth = new Date(currentYear, month + 1, 0);
      
      const monthlyEnrollments = await ClassEnrollment.find({
        paymentStatus: true,
        enrollmentDate: { $gte: startOfMonth, $lte: endOfMonth }
      }).populate('class', 'price');

      const revenue = monthlyEnrollments.reduce((total, enrollment) => {
        return total + (enrollment.class?.price || 0);
      }, 0);

      monthlyRevenueStats.push({
        month: month + 1,
        revenue,
        enrollments: monthlyEnrollments.length
      });
    }

    // Thống kê theo dịch vụ
    const serviceStats = await ClassEnrollment.aggregate([
      {
        $lookup: {
          from: "classes",
          localField: "class", 
          foreignField: "_id",
          as: "classInfo"
        }
      },
      { $unwind: "$classInfo" },
      {
        $group: {
          _id: "$classInfo.serviceName",
          totalEnrollments: { $sum: 1 },
          paidEnrollments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", true] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", true] }, "$classInfo.price", 0] }
          }
        }
      },
      { $sort: { totalEnrollments: -1 } }
    ]);

    // Thống kê CLB
    const clubStats = await Club.aggregate([
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "clubId", 
          as: "classes"
        }
      },
      {
        $addFields: {
          totalClasses: { $size: "$classes" }
        }
      },
      {
        $project: {
          name: 1,
          address: 1,
          totalClasses: 1
        }
      }
    ]);

    // Thống kê user theo tháng
    const userGrowthStats = [];
    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(currentYear, month, 1);
      const endOfMonth = new Date(currentYear, month + 1, 0);
      
      const newUsers = await User.countDocuments({
        role: "user",
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      userGrowthStats.push({
        month: month + 1,
        newUsers
      });
    }

    res.json({
      monthlyRevenue: monthlyRevenueStats,
      serviceStats,
      clubStats,
      userGrowth: userGrowthStats
    });

  } catch (error) {
    console.error("Error fetching detailed stats:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê chi tiết" });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get total enrolled classes
    const enrollments = await ClassEnrollment.find({ 
      user: userId,
      status: true, // Active enrollments
      paymentStatus: true // Paid enrollments
    }).populate('class');
    const totalClasses = enrollments.length;

    // Get total attendance records
    const attendances = await Attendance.find({ 
      userId: userId, // Fixed: use userId instead of user
      isPresent: true
    }).sort({ sessionDate: -1 });
    const totalAttendance = attendances.length;

    // Get all attendance records (including absent) for rate calculation
    const allAttendances = await Attendance.find({ userId: userId });
    const attendanceRate = allAttendances.length > 0 
      ? Math.round((totalAttendance / allAttendances.length) * 100) 
      : 0;

    // Get total payments and spent
    const payments = await Payment.find({ 
      user: userId,
      status: 'approved'
    });
    const totalPayments = payments.length;
    const totalSpent = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(attendances);

    // Get monthly attendance (last 6 months)
    const monthlyAttendance = getMonthlyAttendance(attendances);

    // Get recent activities
    const recentActivities = await getRecentActivities(userId);

    const stats = {
      totalClasses,
      totalAttendance,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      totalPayments,
      totalSpent,
      currentStreak,
      longestStreak,
      monthlyAttendance,
      recentActivities,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ 
      message: "Error fetching statistics",
      error: error.message 
    });
  }
};

// Helper function to calculate streaks
const calculateStreaks = (attendances) => {
  if (attendances.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort by sessionDate descending
  const sortedDates = attendances
    .map(a => new Date(a.sessionDate))
    .sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecent = new Date(sortedDates[0]);
  mostRecent.setHours(0, 0, 0, 0);
  
  // Calculate current streak
  const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 1) {
    currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      tempStreak++;
    } else if (diff > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { currentStreak, longestStreak };
};

// Helper function to get monthly attendance
const getMonthlyAttendance = (attendances) => {
  const monthlyData = {};
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  
  attendances.forEach(attendance => {
    const date = new Date(attendance.sessionDate); // Fixed: use sessionDate
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthLabel = `${months[date.getMonth()]}/${date.getFullYear().toString().slice(2)}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthLabel,
        count: 0,
        timestamp: date.getTime(),
      };
    }
    monthlyData[monthKey].count++;
  });

  // Convert to array and sort by date
  const result = Object.values(monthlyData)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-6)
    .map(({ month, count }) => ({ month, count }));

  return result;
};

// Helper function to get recent activities
const getRecentActivities = async (userId) => {
  try {
    const activities = [];

    // Get recent attendances
    const recentAttendances = await Attendance.find({ 
      userId: userId, // Fixed: use userId
      isPresent: true // Fixed: use isPresent
    })
    .sort({ sessionDate: -1 }) // Fixed: use sessionDate
    .limit(5)
    .populate('classId', 'className'); // Fixed: populate classId with className

    recentAttendances.forEach(attendance => {
      activities.push({
        date: attendance.sessionDate,
        type: 'attendance',
        description: `Điểm danh lớp ${attendance.classId?.className || 'N/A'}`,
      });
    });

    // Get recent payments
    const recentPayments = await Payment.find({ 
      user: userId,
      status: 'approved' // Fixed: use approved
    })
    .sort({ createdAt: -1 })
    .limit(5);

    recentPayments.forEach(payment => {
      activities.push({
        date: payment.createdAt,
        type: 'payment',
        description: `Thanh toán ${(payment.amount || 0).toLocaleString('vi-VN')}đ`,
      });
    });

    // Get recent enrollments
    const recentEnrollments = await ClassEnrollment.find({ 
      user: userId 
    })
    .sort({ enrollmentDate: -1 }) // Fixed: use enrollmentDate
    .limit(5)
    .populate('class', 'className'); // Fixed: use className

    recentEnrollments.forEach(enrollment => {
      activities.push({
        date: enrollment.enrollmentDate,
        type: 'enrollment',
        description: `Đăng ký lớp ${enrollment.class?.className || 'N/A'}`,
      });
    });

    // Sort all activities by date and return top 10
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  } catch (error) {
    console.error("Error getting recent activities:", error);
    return [];
  }
};

// Get instructor statistics
export const getInstructorStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate instructor exists
    const instructor = await User.findById(userId);
    if (!instructor || instructor.role !== 'trainer') {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // Get total classes taught by this instructor
    const classes = await Class.find({ 
      instructor: userId,
      status: { $in: ['ongoing', 'completed', 'upcoming'] }
    });
    const totalClasses = classes.length;

    // Get total attendance sessions where instructor was present
    const classIds = classes.map(c => c._id);
    
    // Count unique sessions (distinct sessionNumber per class)
    const uniqueSessions = await Attendance.aggregate([
      { 
        $match: { 
          classId: { $in: classIds }
        }
      },
      {
        $group: {
          _id: {
            classId: '$classId',
            sessionNumber: '$sessionNumber'
          }
        }
      },
      {
        $count: 'totalSessions'
      }
    ]);
    
    const totalAttendance = uniqueSessions.length > 0 ? uniqueSessions[0].totalSessions : 0;
    
    // Get attendances for streak calculation
    const attendances = await Attendance.find({ 
      classId: { $in: classIds }
    })
    .sort({ sessionDate: -1 })
    .limit(100); // Limit for performance

    // Calculate attendance rate across all classes
    const allAttendances = await Attendance.find({ classId: { $in: classIds } });
    const attendanceRate = allAttendances.length > 0 
      ? Math.round((totalAttendance / allAttendances.length) * 100) 
      : 0;

    // Calculate total earnings from paid enrollments
    const enrollments = await ClassEnrollment.find({
      class: { $in: classIds },
      paymentStatus: true
    }).populate('class', 'price');
    
    const totalSpent = enrollments.reduce((sum, enrollment) => {
      return sum + (enrollment.class?.price || 0);
    }, 0);
    const totalPayments = enrollments.length;

    // Calculate streaks based on teaching sessions
    const { currentStreak, longestStreak } = calculateStreaks(attendances);

    // Get monthly teaching stats
    const monthlyAttendance = getMonthlyAttendance(attendances);

    // Get recent activities for instructor
    const recentActivities = await getInstructorRecentActivities(userId, classIds);

    const stats = {
      totalClasses,
      totalAttendance,
      attendanceRate,
      totalPayments,
      totalSpent,
      currentStreak,
      longestStreak,
      monthlyAttendance,
      recentActivities,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching instructor stats:", error);
    res.status(500).json({ 
      message: "Error fetching instructor statistics",
      error: error.message 
    });
  }
};

// Helper function to get instructor recent activities
const getInstructorRecentActivities = async (instructorId, classIds) => {
  try {
    const activities = [];

    // Get recent teaching sessions
    const recentSessions = await Attendance.find({ 
      classId: { $in: classIds },
      isPresent: true
    })
    .sort({ sessionDate: -1 })
    .limit(10)
    .populate('classId', 'className');

    recentSessions.forEach(session => {
      activities.push({
        date: session.sessionDate,
        type: 'teaching',
        description: `Dạy lớp ${session.classId?.className || 'N/A'}`,
      });
    });

    // Get recent class enrollments
    const recentEnrollments = await ClassEnrollment.find({ 
      class: { $in: classIds },
      paymentStatus: true
    })
    .sort({ enrollmentDate: -1 })
    .limit(5)
    .populate('class', 'className')
    .populate('user', 'fullName');

    recentEnrollments.forEach(enrollment => {
      activities.push({
        date: enrollment.enrollmentDate,
        type: 'enrollment',
        description: `${enrollment.user?.fullName || 'Học viên'} đăng ký ${enrollment.class?.className || 'lớp học'}`,
      });
    });

    // Sort all activities by date and return top 10
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  } catch (error) {
    console.error("Error getting instructor activities:", error);
    return [];
  }
};