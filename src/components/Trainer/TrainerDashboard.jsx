import React, { useState } from "react";
import TrainerNav from "./TrainerNav";
import TrainerHome from "./TrainerHome";
import TrainerClasses from "./TrainerClasses";
import TrainerClassDetail from "./TrainerClassDetail";
import TrainerSchedule from "./TrainerSchedule";
import TrainerAttendance from "./TrainerAttendance";
import TrainerStudents from "./TrainerStudents";
import TrainerStatistics from "./TrainerStatistics";
import TrainerNotifications from "./TrainerNotifications";
import TrainerProfile from "./TrainerProfile";

const TrainerDashboard = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  console.log("🎯 Trainer Active Module:", activeModule);
  console.log("🎯 Selected Class ID:", selectedClassId);

  const renderContent = () => {
    console.log("🔄 Rendering trainer content for:", activeModule);
    switch (activeModule) {
      case "classes":
        return (
          <TrainerClasses
            setActiveModule={setActiveModule}
            setSelectedClassId={setSelectedClassId}
          />
        );
      case "class-detail":
        return (
          <TrainerClassDetail
            classId={selectedClassId}
            onBack={() => setActiveModule("classes")}
          />
        );
      case "schedule":
        return (
          <TrainerSchedule
            setActiveModule={setActiveModule}
            setSelectedClassId={setSelectedClassId}
          />
        );
      case "schedule-detail":
        return (
          <TrainerClassDetail
            classId={selectedClassId}
            onBack={() => setActiveModule("schedule")}
          />
        );
      case "attendance":
        return <TrainerAttendance />;
      case "students":
        return <TrainerStudents />;
      case "statistics":
        return <TrainerStatistics />;
      case "notifications":
        return <TrainerNotifications />;
      case "profile":
        return <TrainerProfile />;
      case "dashboard":
      default:
        return <TrainerHome setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TrainerNav
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />

      {/* Main content area */}
      <main
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: isCollapsed ? "80px" : "320px" }}
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

export default TrainerDashboard;
