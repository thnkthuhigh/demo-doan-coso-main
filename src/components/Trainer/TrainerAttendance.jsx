import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Users,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Dumbbell,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";

const TrainerAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [scheduleDates, setScheduleDates] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1); // 1: select class, 2: select date, 3: mark attendance

  useEffect(() => {
    fetchTrainerClasses();
  }, []);

  const fetchTrainerClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);

      const response = await axios.get(
        `http://localhost:5000/api/classes/instructor/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const activeClasses = response.data.filter(
        (c) => c.status === "ongoing" || c.status === "upcoming"
      );
      setClasses(activeClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async (classId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/classes/${classId}/enrollments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Filter enrolled students (status === true and paymentStatus === true)
      const enrolledStudents = response.data.filter(
        (enrollment) => enrollment.status && enrollment.paymentStatus
      );
      setStudents(enrolledStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Không thể tải danh sách học viên");
    }
  };

  const generateScheduleDates = (classItem) => {
    const start = new Date(classItem.startDate);
    const end = new Date(classItem.endDate);
    const dates = [];

    // Generate dates based on actual schedule from class
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      
      // Check if this day matches any schedule
      const hasSchedule = classItem.schedule?.some(
        (sch) => sch.dayOfWeek === dayOfWeek
      );
      
      if (hasSchedule) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setScheduleDates(dates);
  };

  const calculateSessionNumber = (date) => {
    // Calculate session number based on start date and selected date
    if (!selectedClass || !date) return 1;
    
    const startDate = new Date(selectedClass.startDate);
    const sessionDate = new Date(date);
    
    let sessionNum = 0;
    const current = new Date(startDate);
    
    while (current <= sessionDate) {
      const dayOfWeek = current.getDay();
      const hasSchedule = selectedClass.schedule?.some(
        (sch) => sch.dayOfWeek === dayOfWeek
      );
      
      if (hasSchedule) {
        sessionNum++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return sessionNum;
  };

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    generateScheduleDates(classItem);
    setAttendance({});
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchClassStudents(selectedClass._id);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setSelectedDate(null);
      setStudents([]);
    } else if (step === 2) {
      setStep(1);
      setSelectedClass(null);
      setScheduleDates([]);
    }
  };

  const toggleAttendance = (userId) => {
    setAttendance((prev) => {
      const current = prev[userId];
      // Cycle: undefined → true (có mặt) → false (vắng) → true...
      if (current === undefined) {
        return { ...prev, [userId]: true };
      } else if (current === true) {
        return { ...prev, [userId]: false };
      } else {
        return { ...prev, [userId]: true };
      }
    });
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedDate) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const sessionNumber = calculateSessionNumber(selectedDate);

      console.log("=== SAVING ATTENDANCE ===");
      console.log("Class:", selectedClass.className);
      console.log("Date:", selectedDate.toISOString());
      console.log("Session Number:", sessionNumber);
      console.log("Students to mark:", Object.keys(attendance).length);

      // Tự động set absent cho học viên chưa được điểm danh
      const allStudentIds = students.map(s => s.user._id);
      const markedStudentIds = Object.keys(attendance);
      const unmarkedStudentIds = allStudentIds.filter(id => !markedStudentIds.includes(id));
      
      // Thêm absent cho học viên chưa điểm danh
      unmarkedStudentIds.forEach(userId => {
        attendance[userId] = false; // false = absent
      });

      // Mark attendance cho tất cả student
      let successCount = 0;
      for (const [userId, isPresent] of Object.entries(attendance)) {
        try {
          await axios.post(
            "http://localhost:5000/api/attendance/mark",
            {
              userId,
              classId: selectedClass._id,
              sessionDate: selectedDate.toISOString(),
              sessionNumber: sessionNumber,
              isPresent: isPresent,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          successCount++;
        } catch (err) {
          console.error("Error marking attendance for user:", userId, err);
        }
      }

      // Khóa session sau khi lưu thành công
      if (successCount > 0) {
        try {
          await axios.post(
            "http://localhost:5000/api/attendance/lock-session",
            {
              classId: selectedClass._id,
              sessionDate: selectedDate.toISOString(),
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("✅ Session locked successfully");
        } catch (lockErr) {
          console.error("❌ Error locking session:", lockErr);
        }
      }

      toast.success(`Đã lưu và khóa điểm danh cho ${successCount} học viên!`);
      
      // Reset to step 1
      setStep(1);
      setSelectedClass(null);
      setSelectedDate(null);
      setAttendance({});
      setStudents([]);
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error(error.response?.data?.message || "Không thể lưu điểm danh");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">✅ Điểm Danh</h1>
          <p className="text-gray-600 mt-1">
            {step === 1 && "Chọn lớp học để điểm danh"}
            {step === 2 && "Chọn ngày điểm danh"}
            {step === 3 && `Điểm danh - ${selectedDate?.toLocaleDateString("vi-VN")}`}
          </p>
        </div>
      </div>

      {/* Step 1: Class Selection */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Chọn Lớp Học
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có lớp học đang hoạt động</p>
              </div>
            ) : (
              classes.map((classItem) => (
                <button
                  key={classItem._id}
                  onClick={() => handleClassSelect(classItem)}
                  className="p-4 rounded-xl text-left transition-all bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:shadow-lg text-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <Dumbbell className="h-5 w-5" />
                    <div>
                      <div className="font-semibold">{classItem.className}</div>
                      <div className="text-xs opacity-80">
                        {classItem.currentMembers} học viên
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Step 2: Date Selection */}
      {step === 2 && selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedClass.className} - Chọn Ngày Điểm Danh
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {scheduleDates.map((date, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleDateSelect(date)}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4 hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-400 transition-all duration-300"
              >
                <div className="text-sm text-indigo-600 font-semibold mb-1">
                  {date.toLocaleDateString("vi-VN", { weekday: "short" })}
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-600">
                  Tháng {date.getMonth() + 1}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 3: Student List */}
      {step === 3 && selectedClass && selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedClass.className} - {selectedDate.toLocaleDateString("vi-VN")}
            </h3>
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Đang lưu..." : "💾 Lưu & Khóa Điểm Danh"}
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Học viên chưa được đánh dấu sẽ tự động được ghi nhận là vắng mặt. 
              Sau khi lưu, điểm danh sẽ được khóa và không thể chỉnh sửa từ app này.
            </p>
          </div>

          {students.length > 0 ? (
            <div className="space-y-3">
              {students.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {enrollment.user?.fullName?.charAt(0) ||
                        enrollment.user?.name?.charAt(0) ||
                        "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {enrollment.user?.fullName || enrollment.user?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {enrollment.user?.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAttendance(enrollment.user._id)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        attendance[enrollment.user._id] === true
                          ? "bg-green-100 text-green-700 border-2 border-green-500"
                          : attendance[enrollment.user._id] === false
                          ? "bg-red-100 text-red-700 border-2 border-red-500"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {attendance[enrollment.user._id] === true ? (
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Có mặt
                        </span>
                      ) : attendance[enrollment.user._id] === false ? (
                        <span className="flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          Vắng mặt
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Chưa điểm danh
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Chưa có học viên nào trong lớp</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TrainerAttendance;
