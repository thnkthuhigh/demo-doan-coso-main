import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Calendar, Clock, Dumbbell, Users } from "lucide-react";

const TrainerSchedule = ({ setActiveModule, setSelectedClassId }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
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

      // Filter active classes
      const activeClasses = response.data.filter(
        (c) => c.status === "upcoming" || c.status === "ongoing"
      );
      setClasses(activeClasses);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
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
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-xl shadow-lg">
          <Calendar className="text-white" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📅 Lịch Giảng Dạy</h1>
          <p className="text-gray-600 mt-1">Lịch dạy của bạn trong tuần</p>
        </div>
      </div>

      {classes.length > 0 ? (
        <div className="space-y-4">
          {classes.map((classItem, index) => (
            <motion.div
              key={classItem._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {classItem.className}
                    </h3>
                    <div className="space-y-2">
                      {classItem.schedule?.map((sched, idx) => (
                        <div
                          key={idx}
                          className="flex items-center text-gray-600 text-sm"
                        >
                          <Clock className="h-4 w-4 mr-2 text-indigo-600" />
                          <span className="font-semibold mr-2">
                            {sched.dayOfWeek}:
                          </span>
                          <span>
                            {sched.startTime} - {sched.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mt-2">
                      <Users className="h-4 w-4 mr-2 text-indigo-600" />
                      <span>
                        {classItem.currentMembers}/{classItem.maxMembers} học viên
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    classItem.status === "ongoing"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {classItem.status === "ongoing" ? "Đang diễn ra" : "Sắp diễn ra"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Không có lịch dạy
          </h3>
          <p className="text-gray-500">
            Bạn chưa có lớp học nào đang hoạt động
          </p>
        </div>
      )}
    </div>
  );
};

export default TrainerSchedule;
