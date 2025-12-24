import User from "../models/User.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import Attendance from "../models/Attendance.js";
import Membership from "../models/Membership.js";
import Class from "../models/Class.js";

// Get calendar events for a user
export const getCalendarEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;

    console.log('=== CALENDAR API CALLED ===');
    console.log('User ID:', userId);
    console.log('Year:', year, 'Month:', month);

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found!');
      return res.status(404).json({ message: "User not found" });
    }

    console.log('User found:', user.fullName || user.username);
    console.log('User role:', user.role);

    // Default to current month if not specified
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) - 1 : new Date().getMonth();

    // Get start and end dates for the month
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    
    console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString());

    const events = [];

    // === FOR INSTRUCTORS: Get teaching schedule ===
    if (user.role === 'instructor' || user.role === 'trainer' || user.role === 'admin') {
      console.log('✅ User is instructor/trainer/admin, fetching teaching schedule...');
      
      // Get all classes where user is the instructor
      const instructorClasses = await Class.find({
        instructor: userId,
        status: { $in: ['ongoing', 'upcoming'] }
      }).select('className schedule startDate endDate totalSessions status location');

      console.log('Found instructor classes:', instructorClasses.length);
      
      if (instructorClasses.length > 0) {
        instructorClasses.forEach(c => {
          console.log(`  - ${c.className}: status=${c.status}, location=${c.location}, schedule=`, c.schedule);
        });
      }

      // Get all attendance records for instructor's classes
      const classIds = instructorClasses.map(c => c._id);
      const attendanceRecords = await Attendance.find({
        classId: { $in: classIds },
        sessionDate: { $gte: startDate, $lte: endDate }
      }).select('classId sessionDate sessionNumber');

      // Create a map of attended dates per class
      const attendedDatesMap = {};
      attendanceRecords.forEach(record => {
        const classId = record.classId.toString();
        const dateStr = new Date(record.sessionDate).toISOString().split('T')[0];
        if (!attendedDatesMap[classId]) {
          attendedDatesMap[classId] = new Set();
        }
        attendedDatesMap[classId].add(dateStr);
      });

      console.log('Attended dates map:', Object.keys(attendedDatesMap).map(k => `${k}: ${attendedDatesMap[k].size} sessions`));

      // For each class, generate events based on schedule
      instructorClasses.forEach(classItem => {
        if (!classItem.schedule || classItem.schedule.length === 0) return;

        const classStartDate = new Date(classItem.startDate);
        const classEndDate = new Date(classItem.endDate);
        const classId = classItem._id.toString();
        const attendedDates = attendedDatesMap[classId] || new Set();

        // Generate events for each week in the month
        const monthStart = new Date(startDate);
        const monthEnd = new Date(endDate);

        classItem.schedule.forEach(scheduleItem => {
          const dayOfWeek = scheduleItem.dayOfWeek; // 0 = Sunday, 1 = Monday, etc.
          
          // Find all occurrences of this day in the month
          let currentDate = new Date(monthStart);
          
          // Move to the first occurrence of the target day
          while (currentDate.getDay() !== dayOfWeek && currentDate <= monthEnd) {
            currentDate.setDate(currentDate.getDate() + 1);
          }

          // Add all occurrences of this day in the month
          while (currentDate <= monthEnd) {
            // Only add if within class date range
            if (currentDate >= classStartDate && currentDate <= classEndDate) {
              const eventDate = new Date(currentDate);
              eventDate.setHours(0, 0, 0, 0);
              const dateStr = eventDate.toISOString().split('T')[0];
              
              // Check if this date has attendance
              const hasAttendance = attendedDates.has(dateStr);

              events.push({
                _id: `${classItem._id}-${eventDate.toISOString()}-class`,
                date: eventDate,
                type: hasAttendance ? 'attendance' : 'class',
                title: `Dạy: ${classItem.className}`,
                time: `${scheduleItem.startTime} - ${scheduleItem.endTime}`,
                status: hasAttendance ? 'completed' : 'upcoming',
                location: classItem.location || 'Phòng tập chính',
                className: classItem.className,
                hasAttendance: hasAttendance,
              });
            }
            
            // Move to next week
            currentDate.setDate(currentDate.getDate() + 7);
          }
        });
      });
    }

    // === FOR STUDENTS: Get class enrollments ===
    const enrollments = await ClassEnrollment.find({
      user: userId,
      status: { $in: ['active', 'completed'] },
      enrollmentDate: { $gte: startDate, $lte: endDate }
    }).populate('class', 'name schedule');

    enrollments.forEach(enrollment => {
      if (enrollment.class) {
        events.push({
          _id: enrollment._id.toString(),
          date: enrollment.enrollmentDate,
          type: 'class',
          title: `Đăng ký: ${enrollment.class.name}`,
          time: enrollment.class.schedule || undefined,
          status: enrollment.status,
        });
      }
    });

    // Get attendance records
    const attendances = await Attendance.find({
      user: userId,
      status: 'present',
      date: { $gte: startDate, $lte: endDate }
    }).populate('class', 'name schedule');

    attendances.forEach(attendance => {
      if (attendance.class) {
        events.push({
          _id: attendance._id.toString(),
          date: attendance.date,
          type: 'attendance',
          title: `Điểm danh: ${attendance.class.name}`,
          time: attendance.class.schedule || undefined,
          status: 'completed',
        });
      }
    });

    // Get membership events (start/end dates)
    const memberships = await Membership.find({
      user: userId,
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } }
      ]
    });

    memberships.forEach(membership => {
      // Add start date event
      if (membership.startDate >= startDate && membership.startDate <= endDate) {
        events.push({
          _id: `${membership._id}-start`,
          date: membership.startDate,
          type: 'membership',
          title: `Bắt đầu gói: ${membership.type}`,
          status: 'active',
        });
      }

      // Add end date event
      if (membership.endDate >= startDate && membership.endDate <= endDate) {
        events.push({
          _id: `${membership._id}-end`,
          date: membership.endDate,
          type: 'membership',
          title: `Hết hạn gói: ${membership.type}`,
          status: membership.status === 'active' ? 'upcoming' : 'expired',
        });
      }
    });

    // Also get future class schedules (for next 30 days from current month)
    const futureEndDate = new Date(endDate);
    futureEndDate.setDate(futureEndDate.getDate() + 30);

    const activeEnrollments = await ClassEnrollment.find({
      user: userId,
      status: 'active',
    }).populate({
      path: 'class',
      match: {
        status: { $in: ['ongoing', 'upcoming'] },
        startDate: { $lte: futureEndDate }
      },
      select: 'name schedule startDate'
    });

    activeEnrollments.forEach(enrollment => {
      if (enrollment.class && enrollment.class.startDate) {
        const classDate = new Date(enrollment.class.startDate);
        
        // Only add if within current month view
        if (classDate >= startDate && classDate <= endDate) {
          // Check if we haven't already added this class
          const exists = events.some(e => 
            e.type === 'class' && 
            e.title.includes(enrollment.class.name) &&
            new Date(e.date).toDateString() === classDate.toDateString()
          );

          if (!exists) {
            events.push({
              _id: `${enrollment._id}-schedule`,
              date: classDate,
              type: 'class',
              title: `Lớp: ${enrollment.class.name}`,
              time: enrollment.class.schedule || undefined,
              status: 'upcoming',
            });
          }
        }
      }
    });

    // Sort events by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json(events);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ 
      message: "Error fetching calendar events",
      error: error.message 
    });
  }
};
