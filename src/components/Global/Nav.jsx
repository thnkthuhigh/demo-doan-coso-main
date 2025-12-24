import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  JpContainer,
  JpFlex,
  JpButton,
  JpText,
} from "../Templates/JapaneseLayout";

const JapaneseNav = ({ user, setUser }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navHeight, setNavHeight] = useState(90);
  const navRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update nav height khi scroll
  useEffect(() => {
    setNavHeight(isScrolled ? 70 : 90);
  }, [isScrolled]);

  // Custom hook để set CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--nav-height",
      `${navHeight}px`
    );
  }, [navHeight]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    setIsDropdownOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Điều chỉnh navigation items dựa trên trạng thái đăng nhập
  const getNavigationItems = () => {
    if (!user) {
      // Chưa đăng nhập - chỉ hiện Câu Lạc Bộ và Dịch Vụ
      return [
        { name: "Câu Lạc Bộ", path: "/club" },
        { name: "Dịch Vụ", path: "/services" },
      ];
    } else {
      // Đã đăng nhập - hiện tất cả
      return [
        { name: "Câu Lạc Bộ", path: "/club" },
        { name: "Dịch Vụ", path: "/services" },
        { name: "Lớp Học", path: "/classes" },
        { name: "Lịch Của Tôi", path: "/my-classes" },
        { name: "Điểm Danh", path: "/attendance" },
        { name: "Thẻ Thành Viên", path: "/membership" },
        { name: "Thanh Toán", path: "/payment" },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const getUserInitials = (user) => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRole = (user) => {
    if (user?.role === "admin") return "Quản Trị Viên";
    return "Thành Viên";
  };

  return (
    <>
      {/* Backdrop overlay khi dropdown mở */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
          isScrolled
            ? "backdrop-blur-xl bg-white/95 shadow-xl py-2"
            : "backdrop-blur-md bg-white/90 py-4"
        }`}
      >
        {/* Animated top border */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent transition-all duration-700 ${
            isScrolled ? "opacity-90 via-red-500" : "opacity-50 via-pink-400"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-200 via-pink-200 to-orange-200 animate-pulse opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {/* Main Nav Layout */}
          <div className="flex items-center justify-between">
            {/* LOGO SECTION */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex items-center space-x-3 group relative"
              >
                {/* Background glow effect cho logo area */}
                <div className="absolute -inset-4 bg-gradient-to-r from-red-50 via-pink-50 to-orange-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm"></div>

                <div className="relative z-10">
                  {/* Main logo circle */}
                  <div
                    className={`relative bg-gradient-to-br from-red-400 via-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-xl transform transition-all duration-700 ${
                      isScrolled
                        ? "w-10 h-10 group-hover:scale-110 group-hover:rotate-12"
                        : "w-12 h-12 group-hover:scale-115 group-hover:rotate-[20deg]"
                    }`}
                  >
                    <span
                      className={`text-white font-bold transition-all duration-700 ${
                        isScrolled ? "text-sm" : "text-lg"
                      }`}
                    >
                      桜
                    </span>

                    {/* Multi-layer glow effects */}
                    <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
                    <div className="absolute inset-0.5 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full"></div>
                  </div>

                  {/* Outer glow rings */}
                  <div
                    className={`absolute inset-0 bg-red-400 rounded-full blur-lg opacity-30 group-hover:opacity-60 transition-all duration-700 ${
                      isScrolled ? "w-10 h-10" : "w-12 h-12"
                    }`}
                  ></div>

                  {/* Rotating decorative rings */}
                  <div
                    className={`absolute inset-0 border-2 border-red-300/40 rounded-full animate-spin transition-all duration-700 ${
                      isScrolled ? "w-10 h-10" : "w-12 h-12"
                    }`}
                    style={{ animationDuration: "8s" }}
                  ></div>
                </div>

                <div className="flex flex-col min-w-0 relative z-10">
                  <h1
                    className={`font-bold bg-gradient-to-r from-red-500 via-pink-600 to-red-700 bg-clip-text text-transparent transition-all duration-700 group-hover:from-red-600 group-hover:via-pink-700 group-hover:to-red-800 whitespace-nowrap ${
                      isScrolled ? "text-lg lg:text-xl" : "text-xl lg:text-2xl"
                    }`}
                  >
                    SAKURA CLUB
                  </h1>
                  <span
                    className={`text-gray-500 -mt-1 tracking-wider transition-all duration-700 font-medium group-hover:text-red-500 whitespace-nowrap ${
                      isScrolled ? "text-xs" : "text-sm"
                    }`}
                  >
                    Gym & Fitness
                  </span>

                  {/* Decorative underline */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-600 group-hover:w-full transition-all duration-500"></div>
                </div>
              </Link>
            </div>

            {/* NAVIGATION CENTER */}
            <div className="hidden lg:flex flex-1 justify-center px-8">
              <div className="flex items-center bg-white/90 backdrop-blur-xl rounded-full shadow-xl border border-gray-200/50 transition-all duration-500 hover:shadow-2xl hover:bg-white/95 relative overflow-hidden px-2">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-50/30 via-transparent to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-center space-x-0 relative z-10">
                  {navigationItems.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative px-3 py-2.5 rounded-full text-sm font-medium transition-all duration-300 group whitespace-nowrap ${
                        isActiveLink(item.path)
                          ? "text-white bg-gradient-to-r from-red-500 to-pink-600 shadow-lg scale-105 z-20"
                          : "text-gray-700 hover:text-red-600 hover:bg-red-50/80 hover:scale-102 z-10"
                      }`}
                    >
                      <span className="relative z-10 text-center">
                        {/* Responsive text */}
                        <span className="hidden xl:inline">{item.name}</span>
                        <span className="hidden lg:inline xl:hidden">
                          {item.name === "Câu Lạc Bộ"
                            ? "CLB"
                            : item.name === "Dịch Vụ"
                            ? "Dịch Vụ"
                            : item.name === "Lớp Học"
                            ? "Lớp Học"
                            : item.name === "Lịch Của Tôi"
                            ? "Lịch"
                            : item.name === "Điểm Danh"
                            ? "Điểm Danh"
                            : item.name === "Thẻ Thành Viên"
                            ? "Thành Viên"
                            : item.name === "Thanh Toán"
                            ? "Thanh Toán"
                            : item.name}
                        </span>
                      </span>

                      {/* Active state với multiple layers */}
                      {isActiveLink(item.path) && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-full opacity-20"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>

                          {/* Floating indicators */}
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full"></div>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full"></div>
                        </>
                      )}

                      {/* Hover effect - chỉ hiển thị khi không active */}
                      {!isActiveLink(item.path) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-pink-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Navigation decorative elements - Đơn giản hóa */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-300/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-300/60 to-transparent"></div>
              </div>
            </div>

            {/* USER SECTION */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  {/* Background area effect */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-pink-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm"></div>

                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`relative z-10 flex items-center space-x-3 px-4 py-3 bg-white/85 backdrop-blur-xl rounded-2xl hover:bg-white/95 transition-all duration-500 ease-out group border border-gray-200/50 shadow-lg hover:shadow-2xl transform ${
                      isDropdownOpen
                        ? "bg-white/95 shadow-2xl scale-105 ring-2 ring-red-200"
                        : "hover:scale-105"
                    }`}
                  >
                    {/* Avatar section */}
                    <div className="relative flex-shrink-0">
                      {user.avatar && user.avatar.url ? (
                        <img
                          src={user.avatar.url}
                          alt={user.fullName || "Avatar"}
                          className={`rounded-xl object-cover shadow-xl transition-all duration-500 ease-out group-hover:scale-110 ring-2 ring-white ${
                            isScrolled ? "w-8 h-8" : "w-10 h-10"
                          } ${isDropdownOpen ? "scale-110 ring-red-300" : ""}`}
                        />
                      ) : (
                        <div
                          className={`bg-gradient-to-br from-red-400 via-pink-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-xl transition-all duration-500 ease-out group-hover:scale-110 ring-2 ring-white ${
                            isScrolled ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"
                          } ${isDropdownOpen ? "scale-110 ring-red-300" : ""}`}
                        >
                          {getUserInitials(user)}
                        </div>
                      )}

                      {/* Status indicator */}
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white transition-all duration-300 ${
                          isDropdownOpen ? "animate-bounce" : "animate-pulse"
                        }`}
                      >
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                    </div>

                    {/* User Info - Ẩn trên mobile và tablet */}
                    <div
                      className={`text-left min-w-0 transition-all duration-700 ease-out hidden lg:block ${
                        isDropdownOpen ? "opacity-80" : "opacity-100"
                      }`}
                    >
                      <p
                        className={`font-semibold text-gray-800 whitespace-nowrap truncate transition-all duration-500 ${
                          isScrolled ? "text-sm" : "text-base"
                        }`}
                      >
                        {user.fullName || "Người Dùng"}
                      </p>
                      <p
                        className={`text-gray-500 whitespace-nowrap transition-all duration-500 ${
                          isScrolled ? "text-xs" : "text-sm"
                        }`}
                      >
                        {getUserRole(user)}
                      </p>
                    </div>

                    {/* Dropdown arrow */}
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-all duration-500 ease-out flex-shrink-0 ${
                        isDropdownOpen
                          ? "rotate-180 text-red-500 scale-125"
                          : "group-hover:text-red-500 group-hover:scale-110"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>

                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-pink-200/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </button>

                  {/* Dropdown menu */}
                  <div
                    className={`absolute right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden z-50 transition-all duration-700 ease-out ${
                      isDropdownOpen
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
                    }`}
                    style={{
                      width: "320px",
                      transformOrigin: "top right",
                    }}
                  >
                    {/* Header */}
                    <div className="px-5 py-5 bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 border-b border-gray-200/50 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-200 to-pink-200"></div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-300/30 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                      </div>

                      <div className="flex items-center space-x-4 relative">
                        <div className="flex-shrink-0">
                          {user.avatar && user.avatar.url ? (
                            <img
                              src={user.avatar.url}
                              alt={user.fullName || "Avatar"}
                              className="w-14 h-14 rounded-2xl object-cover shadow-xl ring-4 ring-white/80"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl ring-4 ring-white/80">
                              {getUserInitials(user)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base truncate">
                            {user.fullName || "Người Dùng"}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1 font-medium">
                            {getUserRole(user)}
                          </p>
                          <p className="text-xs text-gray-500 truncate bg-white/60 px-2 py-1 rounded-lg">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/user"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-300 group"
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium text-sm">
                          Thông Tin Cá Nhân
                        </span>
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-3 px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-600 transition-all duration-300 group"
                        >
                          <div className="w-9 h-9 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg
                              className="w-4 h-4 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium text-sm">
                            Bảng Điều Khiển
                          </span>
                        </Link>
                      )}

                      <div className="border-t border-gray-200/50 my-2 mx-5"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-5 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 w-full text-left group"
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        </div>
                        <span className="font-medium text-sm">Đăng Xuất</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Login/Register Buttons */
                <div className="flex items-center space-x-3 relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-50/30 via-green-50/30 to-red-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm"></div>

                  <Link
                    to="/login"
                    className="relative z-10 px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 transition-all duration-300 rounded-2xl hover:bg-red-50/80 whitespace-nowrap group"
                  >
                    <span className="relative z-10">Đăng Nhập</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-pink-100/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>

                  <Link
                    to="/sign-up"
                    className="relative z-10 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-400 whitespace-nowrap shadow-xl hover:shadow-2xl transform hover:scale-105 overflow-hidden group"
                  >
                    <span className="relative z-10">Đăng Ký</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden relative z-10 p-3 rounded-2xl hover:bg-gray-100/80 transition-all duration-300 bg-white/85 backdrop-blur-xl shadow-lg ml-3 group"
              >
                <svg
                  className={`w-6 h-6 text-gray-700 transition-transform duration-400 ${
                    isMobileMenuOpen
                      ? "rotate-90 scale-110"
                      : "group-hover:scale-110"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isMobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200/50 pt-6 mt-6 bg-white/85 backdrop-blur-xl rounded-3xl mx-4 px-6 shadow-xl animate-jp-fade-in">
              <div className="space-y-3 pb-6">
                {navigationItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-6 py-4 rounded-2xl transition-all duration-300 font-medium ${
                      isActiveLink(item.path)
                        ? "text-white bg-gradient-to-r from-red-500 to-pink-600 shadow-lg"
                        : "text-gray-700 hover:text-red-600 hover:bg-red-50/80"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom animated border */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent transition-all duration-700 ${
            isScrolled ? "opacity-40 via-gray-400" : "opacity-20 via-gray-200"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-200 via-pink-200 to-orange-200 animate-pulse opacity-20"></div>
        </div>
      </nav>

      {/* Spacer để tránh nav che khuất nội dung */}
      <div
        className={`transition-all duration-700 ${
          isScrolled ? "h-[70px]" : "h-[90px]"
        }`}
        aria-hidden="true"
      />
    </>
  );
};

export default JapaneseNav;
