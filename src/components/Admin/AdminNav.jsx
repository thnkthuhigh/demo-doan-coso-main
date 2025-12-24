import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ImageIcon,
  Calendar,
  BarChart,
  CreditCard,
  UserCheck,
  Building,
  Dumbbell,
  ClipboardList,
  Crown,
  LogOut,
  Cherry,
  Mountain,
  Waves,
  MapPin,
  MessageCircle,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminNav = ({ activeModule, setActiveModule, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Bảng Điều Khiển",
      icon: <LayoutDashboard size={20} />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "users",
      label: "Quản Lý Người Dùng",
      icon: <Users size={20} />,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "classes",
      label: "Quản Lý Lớp Học",
      icon: <Calendar size={20} />,
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "attendance",
      label: "Điểm Danh",
      icon: <ClipboardList size={20} />,
      color: "from-orange-500 to-amber-500",
    },
    {
      id: "payments",
      label: "Thanh Toán",
      icon: <CreditCard size={20} />,
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "memberships",
      label: "Thành Viên",
      icon: <UserCheck size={20} />,
      color: "from-indigo-500 to-blue-500",
    },
    {
      id: "services",
      label: "Dịch Vụ",
      icon: <Dumbbell size={20} />,
      color: "from-teal-500 to-cyan-500",
    },
    {
      id: "clubs",
      label: "Câu Lạc Bộ",
      icon: <Building size={20} />,
      color: "from-yellow-500 to-amber-500",
    },
    {
      id: "images",
      label: "Hình Ảnh",
      icon: <ImageIcon size={20} />,
      color: "from-gray-500 to-slate-500",
    },
    {
      id: "stats",
      label: "Thống Kê",
      icon: <BarChart size={20} />,
      color: "from-red-500 to-pink-500",
    },
    {
      id: "locations",
      label: "Gym Locations",
      icon: <MapPin size={20} />,
      color: "from-blue-500 to-indigo-500",
    },
    {
      id: "chat",
      label: "Chat & Hỗ Trợ",
      icon: <MessageCircle size={20} />,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <>
      {/* Enhanced Global CSS */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        .admin-font {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        .admin-heading {
          font-family: "Inter", sans-serif;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .admin-light {
          font-family: "Inter", sans-serif;
          font-weight: 300;
          letter-spacing: 0.01em;
        }

        /* Enhanced scrollbar styling */
        .admin-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(248, 113, 113, 0.5) rgba(0, 0, 0, 0.05);
        }

        .admin-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .admin-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
          margin: 8px 0;
        }

        .admin-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f87171, #fbbf24);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .admin-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ef4444, #f59e0b);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .admin-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }

        /* Smooth animations */
        @keyframes float-smooth {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(1deg);
          }
        }

        @keyframes ripple-effect {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes cherry-drift {
          0% {
            transform: translateY(-8px) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(8px) rotate(180deg);
            opacity: 0;
          }
        }

        .float-smooth {
          animation: float-smooth 3s ease-in-out infinite;
        }
        .ripple-effect {
          animation: ripple-effect 2s ease-out infinite;
        }
        .cherry-drift {
          animation: cherry-drift 4s ease-in-out infinite;
        }

        /* Beautiful gradients */
        .gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .gradient-sakura {
          background: linear-gradient(135deg, #ffeef8 0%, #f3e7e9 100%);
        }

        .gradient-mount-fuji {
          background: linear-gradient(
            180deg,
            #e3f2fd 0%,
            #bbdefb 50%,
            #90caf9 100%
          );
        }

        /* Glass card styling */
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .glass-card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card-hover:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
      `}</style>

      <motion.aside
        initial={{ x: -240, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          width: isCollapsed ? 64 : 240
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed left-0 top-0 h-screen z-30 overflow-hidden"
        style={{ width: isCollapsed ? '64px' : '240px' }}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-4 z-50 p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all duration-300 group ${
            isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-3'
          }`}
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4 text-gray-700 group-hover:text-gray-900" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-700 group-hover:text-gray-900" />
          )}
        </button>
        {/* Main container */}
        <div className="h-full relative overflow-hidden flex flex-col">
          {/* Background with decorative pattern */}
          <div className="absolute inset-0 gradient-mount-fuji">
            {/* Decorative floating elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-20 left-4">
                <Cherry className="h-8 w-8 text-pink-500 cherry-drift" />
              </div>
              <div className="absolute top-40 right-6">
                <Mountain className="h-12 w-12 text-blue-400 float-smooth" />
              </div>
              <div className="absolute bottom-40 left-8">
                <Waves className="h-6 w-6 text-cyan-500 ripple-effect" />
              </div>
            </div>
          </div>

          {/* Glass morphism overlay */}
          <div className="absolute inset-0 glass-card border-r-2 border-white/20"></div>

          {/* Header Section */}
          <div className={`relative z-10 border-b border-white/20 flex-shrink-0 ${isCollapsed ? 'p-3' : 'p-6'}`}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}
            >
              {/* Logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                <div className={`relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30 ${
                  isCollapsed ? 'w-12 h-12' : 'w-14 h-14'
                }`}>
                  <Crown className={`text-white drop-shadow-lg ${isCollapsed ? 'h-6 w-6' : 'h-8 w-8'}`} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
              </div>

              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1"
                >
                  <h2 className="admin-heading text-base text-gray-800">
                    Bảng Điều Khiển
                  </h2>
                  <p className="admin-light text-xs text-gray-600">
                    Quản Trị Hệ Thống
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="w-8 h-px bg-gradient-to-r from-orange-400 to-red-500"></div>
                    <div className="w-2 h-2 bg-red-500 rotate-45 mx-2"></div>
                    <div className="w-8 h-px bg-gradient-to-r from-red-500 to-pink-500"></div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Navigation Menu with scroll */}
          <div className="relative z-10 flex-1 min-h-0">
            <div className="h-full overflow-y-auto admin-scrollbar">
              <div className={`pb-4 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-6"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-4 h-px bg-gradient-to-r from-gray-400 to-transparent"></div>
                      <span className="admin-light text-xs text-gray-600 uppercase tracking-wider">
                        Hệ Thống Quản Lý
                      </span>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <button
                        onClick={() => setActiveModule(item.id)}
                        className={`
                          group relative w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'p-4'} rounded-2xl transition-all duration-500 glass-card-hover
                          ${
                            activeModule === item.id
                              ? "glass-card shadow-2xl border-2 border-white/40 transform scale-105"
                              : "hover:glass-card hover:shadow-lg bg-black/10 hover:bg-white/20"
                          }
                        `}
                        title={isCollapsed ? item.label : ''}
                      >
                        {/* Active indicator */}
                        {activeModule === item.id && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute inset-0 bg-gradient-to-r opacity-20 rounded-2xl"
                            style={{
                              background: `linear-gradient(135deg, ${
                                item.color.split(" ")[1]
                              }, ${item.color.split(" ")[3]})`,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}

                        {/* Icon container */}
                        <div
                          className={`
                            relative flex items-center justify-center rounded-xl transition-all duration-300
                            ${
                              activeModule === item.id
                                ? "w-12 h-12 bg-gradient-to-br text-white shadow-lg scale-110"
                                : "w-10 h-10 bg-white/80 text-gray-600 group-hover:bg-white group-hover:scale-110"
                            }
                          `}
                          style={
                            activeModule === item.id
                              ? {
                                  background: `linear-gradient(135deg, ${
                                    item.color.split(" ")[1]
                                  }, ${item.color.split(" ")[3]})`,
                                }
                              : {}
                          }
                        >
                          {item.icon}

                          {/* Ripple effect */}
                          {activeModule === item.id && (
                            <div className="absolute inset-0 rounded-xl bg-black/20 ripple-effect"></div>
                          )}
                        </div>

                        {!isCollapsed && (
                          <div className="ml-4 flex-1 text-left">
                            <div
                              className={`
                              admin-font text-sm transition-colors duration-300
                              ${
                                activeModule === item.id
                                  ? "text-gray-800 font-semibold"
                                  : "text-gray-700 group-hover:text-gray-800"
                              }
                            `}
                          >
                            {item.label}
                          </div>
                        </div>
                        )}

                        {!isCollapsed && activeModule === item.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-lg"
                          />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom spacing for scroll */}
                <div className="h-8"></div>
              </div>
            </div>
          </div>

          {/* Bottom section with logout */}
          <div className={`relative z-10 bg-gradient-to-t from-white/95 to-white/80 backdrop-blur-sm border-t border-white/20 flex-shrink-0 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className={`group w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'p-4'} bg-white/80 hover:bg-red-50 rounded-2xl transition-all duration-300 glass-card-hover border border-white/40 hover:border-red-200`}
              title={isCollapsed ? "Đăng Xuất" : ''}
            >
              <div className={`bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                isCollapsed ? 'w-8 h-8' : 'w-10 h-10'
              }`}>
                <LogOut className={`text-red-600 ${isCollapsed ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </div>

              {!isCollapsed && (
                <div className="ml-4 text-left flex-1">
                  <div className="admin-font text-sm font-medium text-gray-800">
                    Đăng Xuất
                  </div>
                  <div className="admin-light text-xs text-gray-500">
                    Thoát khỏi hệ thống
                  </div>
                </div>
              )}
            </motion.button>

            {/* Version info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-center"
            >
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-3"></div>
              <p className="admin-light text-xs text-gray-500">
                Royal Fitness Admin v2.0
              </p>
              <p className="admin-light text-xs text-gray-400 mt-1">
                Hệ Thống Quản Lý Gym
              </p>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default AdminNav;
