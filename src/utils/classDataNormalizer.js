/**
 * Normalize class data to ensure consistency between web and mobile
 * Handles different field names and structures
 */
export const normalizeClassData = (classData) => {
  if (!classData) return null;

  return {
    _id: classData._id,

    // Name fields - support both formats
    name: classData.name || classData.className,
    className: classData.className || classData.name,

    // Capacity fields - support both formats
    capacity: classData.capacity || classData.maxMembers,
    maxMembers: classData.maxMembers || classData.capacity,

    // Enrollment fields - support both formats
    enrolled: classData.enrolled || classData.currentMembers || 0,
    currentMembers: classData.currentMembers || classData.enrolled || 0,

    // Instructor fields - normalize to both formats
    instructor: classData.instructor
      ? typeof classData.instructor === "object"
        ? {
            _id: classData.instructor._id,
            fullName:
              classData.instructor.fullName ||
              classData.instructor.username ||
              classData.instructorName ||
              "Unknown",
            username: classData.instructor.username,
            email: classData.instructor.email,
          }
        : {
            _id: classData.instructor,
            fullName: classData.instructorName || "Unknown",
          }
      : {
          _id: null,
          fullName: classData.instructorName || "Unknown",
        },
    instructorName:
      classData.instructorName ||
      classData.instructor?.fullName ||
      classData.instructor?.username ||
      "Unknown",

    // Service fields
    service:
      typeof classData.service === "object"
        ? classData.service
        : { _id: classData.service || classData.serviceId },
    serviceId:
      typeof classData.service === "object"
        ? classData.service?._id
        : classData.service || classData.serviceId,
    serviceName:
      classData.serviceName ||
      classData.service?.name ||
      classData.service?.serviceName,

    // Schedule and dates
    schedule: classData.schedule || [],
    startDate: classData.startDate,
    endDate: classData.endDate,

    // Location
    location: classData.location,

    // Status
    status: classData.status || "active",

    // Session info
    totalSessions: classData.totalSessions || 0,
    currentSession: classData.currentSession || 0,

    // Other fields
    description: classData.description,
    price: classData.price,
    duration: classData.duration,
    level: classData.level,
    category: classData.category,
    tags: classData.tags || [],
    image: classData.image,

    // Timestamps
    createdAt: classData.createdAt,
    updatedAt: classData.updatedAt,
  };
};

/**
 * Normalize attendance data
 */
export const normalizeAttendanceData = (attendance) => {
  if (!attendance) return null;

  return {
    _id: attendance._id,
    date: attendance.date || attendance.sessionDate,
    sessionDate: attendance.sessionDate || attendance.date,
    sessionNumber: attendance.sessionNumber || 1,
    status: attendance.status || (attendance.isPresent ? "present" : "absent"),
    isPresent:
      attendance.isPresent !== undefined
        ? attendance.isPresent
        : attendance.status === "present",
    classInfo: attendance.classInfo || attendance.classId,
    classId: attendance.classId || attendance.classInfo,
    userId: attendance.userId || attendance.user,
    user: attendance.user || attendance.userId,
    notes: attendance.notes,
    markedAt: attendance.markedAt,
    isLocked: attendance.isLocked || false,
  };
};

/**
 * Normalize array of classes
 */
export const normalizeClassArray = (classes) => {
  if (!Array.isArray(classes)) return [];
  return classes.map(normalizeClassData).filter(Boolean);
};

/**
 * Normalize array of attendance records
 */
export const normalizeAttendanceArray = (attendances) => {
  if (!Array.isArray(attendances)) return [];
  return attendances.map(normalizeAttendanceData).filter(Boolean);
};

/**
 * Calculate attendance statistics
 */
export const calculateAttendanceStats = (attendances) => {
  if (!Array.isArray(attendances) || attendances.length === 0) {
    return {
      totalSessions: 0,
      attendedSessions: 0,
      missedSessions: 0,
      upcomingSessions: 0,
      attendanceRate: 0,
    };
  }

  const normalizedAttendances = normalizeAttendanceArray(attendances);
  
  const attendedSessions = normalizedAttendances.filter(
    (a) => a.status === "present" || a.isPresent === true
  ).length;
  
  const missedSessions = normalizedAttendances.filter(
    (a) => a.status === "absent" || a.isPresent === false
  ).length;
  
  const totalSessions = normalizedAttendances.length;
  const attendanceRate =
    totalSessions > 0
      ? Math.round((attendedSessions / totalSessions) * 100)
      : 0;

  return {
    totalSessions,
    attendedSessions,
    missedSessions,
    upcomingSessions: 0,
    attendanceRate,
  };
};
