import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Mail,
  Crown,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
  ChevronRight,
} from "lucide-react";

export default function Login({ setUser }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Đảm bảo body không có padding khi vào trang Login
  useEffect(() => {
    document.body.style.paddingTop = "0";
    document.body.classList.remove("with-navbar"); // Phòng trường hợp còn sót

    return () => {
      // Không cần restore gì vì CSS đã bỏ rồi
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loginData = {
        email: identifier.trim(),
        password: password,
      };

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const { token, user } = response.data;

      if (!token) {
        throw new Error("Token không được trả về từ server");
      }

      if (!user) {
        throw new Error("Thông tin user không được trả về từ server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user._id || user.id) {
        try {
          const userId = user._id || user.id;
          const userResponse = await axios.get(
            `http://localhost:5000/api/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              timeout: 5000,
            }
          );

          const fullUserData = userResponse.data;
          localStorage.setItem("user", JSON.stringify(fullUserData));
          setUser(fullUserData);

          // Redirect based on user role
          if (fullUserData.role === "admin") {
            navigate("/admin");
          } else if (fullUserData.role === "trainer") {
            navigate("/trainer");
          } else {
            navigate("/");
          }
        } catch (profileError) {
          console.error("❌ Error fetching complete profile:", profileError);
          setUser(user);

          // Redirect based on basic user role if profile fetch fails
          if (user.role === "admin") {
            navigate("/admin");
          } else if (user.role === "trainer") {
            navigate("/trainer");
          } else {
            navigate("/");
          }
        }
      } else {
        setUser(user);
        
        // Redirect based on user role
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "trainer") {
          navigate("/trainer");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      let errorMessage = "Đăng nhập thất bại, vui lòng thử lại sau.";

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage =
              error.response.data?.message ||
              "Thông tin đăng nhập không hợp lệ";
            break;
          case 401:
            errorMessage = "Email/Username hoặc mật khẩu không chính xác";
            break;
          case 404:
            errorMessage = "Tài khoản không tồn tại";
            break;
          case 429:
            errorMessage = "Quá nhiều lần thử đăng nhập, vui lòng thử lại sau";
            break;
          case 500:
            errorMessage = "Lỗi server, vui lòng thử lại sau";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage =
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        /* Đảm bảo Login full screen */
        body {
          padding-top: 0 !important;
          margin: 0 !important;
        }

        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        .royal-font {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.5;
        }

        .royal-heading {
          font-family: "Inter", sans-serif;
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.2;
        }

        /* Static Background */
        .royal-aurora {
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 25%,
            #f093fb 50%,
            #f5576c 75%,
            #4facfe 100%
          );
        }

        .royal-glass {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.25) 0%,
            rgba(255, 255, 255, 0.05) 100%
          );
          backdrop-filter: blur(30px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .royal-input {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.7) 100%
          );
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .royal-input:focus {
          border: 2px solid rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1),
            0 15px 35px -5px rgba(99, 102, 241, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .royal-button {
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 50%,
            #f093fb 100%
          );
          border: none;
          border-radius: 20px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .royal-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(102, 126, 234, 0.4);
        }
      `}</style>

      {/* FULL SCREEN LOGIN */}
      <div className="min-h-screen royal-aurora relative overflow-hidden flex">
        {/* Left Panel - Branding */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Static decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-32 h-32 border-2 border-white/20 rounded-full opacity-60"></div>
            <div className="absolute bottom-1/4 right-1/3 w-24 h-24 border-2 border-purple-300/30 rounded-lg rotate-45 opacity-50"></div>
            <div className="absolute top-3/4 left-1/4 w-16 h-16 border-2 border-pink-300/40 rounded-full opacity-40"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Logo & Brand */}
              <div className="mb-12">
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl"></div>
                  <div className="relative royal-glass rounded-3xl p-6 border-2 border-white/30">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-75"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                          <Crown className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <h1 className="royal-heading text-3xl text-white mb-1">
                          Sakura Club
                        </h1>
                        <p className="royal-font text-white/80">
                          Premium Fitness
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hero Text */}
                <div>
                  <h2 className="royal-heading text-6xl xl:text-7xl text-white mb-6 leading-tight">
                    Chào mừng
                    <br />
                    <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                      trở lại
                    </span>
                  </h2>
                  <p className="royal-font text-xl text-white/80 mb-8 leading-relaxed max-w-md">
                    Tiếp tục hành trình chinh phục bản thân và đạt được những
                    mục tiêu fitness tuyệt vời
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  {[
                    {
                      number: "10K+",
                      label: "Thành viên",
                    },
                    {
                      number: "50+",
                      label: "Huấn luyện viên",
                    },
                    {
                      number: "24/7",
                      label: "Hoạt động",
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="royal-glass rounded-2xl p-4 text-center border border-white/20"
                    >
                      <div className="royal-heading text-2xl text-white mb-1">
                        {stat.number}
                      </div>
                      <div className="royal-font text-sm text-white/70">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <motion.div
          className="w-full lg:w-1/2 xl:w-2/5 relative flex items-center justify-center p-8 lg:p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-black/20 lg:bg-transparent"></div>

          {/* Form Container */}
          <div className="relative z-10 w-full max-w-md">
            {/* Header Mobile Only */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="royal-heading text-2xl text-white">
                    Sakura Club
                  </h1>
                  <p className="royal-font text-white/80 text-sm">
                    Premium Fitness
                  </p>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="royal-glass rounded-3xl overflow-hidden border border-white/20">
              {/* Form Header */}
              <div className="p-8 pb-6">
                <div className="text-center mb-8">
                  <h2 className="royal-heading text-3xl text-gray-800 mb-2">
                    Đăng nhập
                  </h2>
                  <p className="royal-font text-gray-600">
                    Chào mừng bạn quay trở lại
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="royal-font text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Mail size={16} className="mr-2 text-purple-500" />
                      Email hoặc tên đăng nhập
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="royal-input w-full pl-12 pr-4 py-4 royal-font text-gray-800 placeholder-gray-400 focus:outline-none"
                        placeholder="Nhập email hoặc username"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="royal-font text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Lock size={16} className="mr-2 text-purple-500" />
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="royal-input w-full pl-12 pr-12 py-4 royal-font text-gray-800 placeholder-gray-400 focus:outline-none"
                        placeholder="••••••••••"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-500 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Options Row */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="ml-2 royal-font text-sm text-gray-600">
                        Ghi nhớ tôi
                      </span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="royal-font text-sm text-purple-600 hover:text-purple-500 transition-colors"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="royal-glass bg-red-50/80 border border-red-200/50 rounded-2xl p-4 flex items-start"
                      >
                        <Shield className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="royal-font text-sm text-red-700">
                          {error}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`royal-button w-full py-4 px-6 text-white royal-font font-semibold text-lg relative overflow-hidden group ${
                      loading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          <span>Đang đăng nhập...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-3 h-5 w-5" />
                          <span>Đăng nhập ngay</span>
                          <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </form>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 px-8 py-6 text-center border-t border-white/20">
                <p className="royal-font text-gray-600">
                  Chưa có tài khoản?{" "}
                  <Link
                    to="/sign-up"
                    className="font-semibold text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Đăng ký miễn phí
                  </Link>
                </p>
              </div>
            </div>

            {/* Bottom Links */}
            <div className="mt-8 text-center">
              <p className="royal-font text-sm text-white/70 lg:text-gray-500">
                Bằng cách đăng nhập, bạn đồng ý với{" "}
                <a
                  href="#"
                  className="text-purple-400 lg:text-purple-600 hover:underline"
                >
                  Điều khoản
                </a>{" "}
                và{" "}
                <a
                  href="#"
                  className="text-purple-400 lg:text-purple-600 hover:underline"
                >
                  Chính sách bảo mật
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
