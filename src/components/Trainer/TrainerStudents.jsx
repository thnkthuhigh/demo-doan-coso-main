import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, Search, Mail, Phone, Calendar, Award, Dumbbell } from "lucide-react";
import { toast } from "react-toastify";

const TrainerStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);

      // Get all classes of the trainer
      const classesRes = await axios.get(
        `http://localhost:5000/api/classes/instructor/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const classes = classesRes.data;

      // Get all students from all classes
      const allStudentsMap = new Map();

      for (const classItem of classes) {
        try {
          const enrollmentsRes = await axios.get(
            `http://localhost:5000/api/classes/${classItem._id}/enrollments`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          enrollmentsRes.data.forEach((enrollment) => {
            if (enrollment.user) {
              const studentId = enrollment.user._id;
              if (!allStudentsMap.has(studentId)) {
                allStudentsMap.set(studentId, {
                  ...enrollment.user,
                  classes: [classItem.className],
                });
              } else {
                const existing = allStudentsMap.get(studentId);
                existing.classes.push(classItem.className);
              }
            }
          });
        } catch (err) {
          console.error(`Error fetching enrollments for class ${classItem._id}:`, err);
        }
      }

      setStudents(Array.from(allStudentsMap.values()));
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg">
          <Users className="text-white" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👥 Học Viên</h1>
          <p className="text-gray-600 mt-1">Danh sách học viên của bạn</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm học viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {student.fullName?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    {student.fullName || student.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="h-3 w-3 mr-1" />
                    <span>{student.classes?.length || 0} lớp học</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <Mail className="h-4 w-4 mr-2 text-indigo-600" />
                  <span className="truncate">{student.email}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="h-4 w-4 mr-2 text-indigo-600" />
                    <span>{student.phone}</span>
                  </div>
                )}
              </div>

              {student.classes && student.classes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold mb-2">
                    Các lớp tham gia:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {student.classes.slice(0, 2).map((className, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                      >
                        <Dumbbell className="h-3 w-3 mr-1" />
                        {className}
                      </span>
                    ))}
                    {student.classes.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{student.classes.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? "Không tìm thấy học viên" : "Chưa có học viên"}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Thử thay đổi từ khóa tìm kiếm"
              : "Học viên sẽ xuất hiện khi có người đăng ký lớp của bạn"}
          </p>
        </div>
      )}

      {/* Summary */}
      {students.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600">
                {students.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Tổng học viên</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {students.reduce((sum, s) => sum + (s.classes?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Tổng đăng ký lớp
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerStudents;
