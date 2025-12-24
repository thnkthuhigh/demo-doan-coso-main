import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import PricingPlans from "../PricingPlans";
import ConfirmationDialog from "../PricingPlans/index";
import Toast from "../common/Toast";
import {
  Crown,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Star,
  Sparkles,
  Award,
  Zap,
  Heart,
  Shield,
  Users,
  Timer,
  Target,
  Gift,
  Cherry,
  Mountain,
  Waves,
  Flower2,
  Leaf,
  Sun,
  Moon,
} from "lucide-react";

export default function MembershipPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [filterCategory, setFilterCategory] = useState("standard");
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);

      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/users/${decoded.userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // Check if this is an upgrade request
    const urlParams = new URLSearchParams(window.location.search);
    const upgradeParam = urlParams.get("upgrade");

    if (upgradeParam === "true") {
      setIsUpgrade(true);

      // Get current membership from localStorage
      const storedMembership = localStorage.getItem("currentMembership");
      if (storedMembership) {
        setCurrentMembership(JSON.parse(storedMembership));
      }
    }
  }, []);

  // Update the handleSelectPlan function to go directly to payment
  const handleSelectPlan = async (plan) => {
    // First set the selected plan
    setSelectedPlan(plan);

    // If user is not logged in, redirect to login
    if (!userId) {
      setToast({
        message: "Vui lòng đăng nhập để đăng ký gói tập",
        type: "error",
      });
      navigate("/login");
      return;
    }

    // Check if user already has an active membership
    if (user && user.membership && user.membership.endDate) {
      const endDate = new Date(user.membership.endDate);
      if (endDate > new Date()) {
        setToast({
          message:
            "Bạn đã có thẻ thành viên đang hoạt động. Vui lòng chờ hết hạn hoặc chọn nâng cấp gói tập.",
          type: "error",
        });
        return;
      }
    }

    // Skip confirmation and proceed directly to registration
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({
          text: "Bạn cần đăng nhập để đăng ký thành viên.",
          type: "error",
        });
        navigate("/login");
        return;
      }

      // Tính ngày hết hạn từ ngày hiện tại
      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000
      );

      const membershipData = {
        userId,
        type: plan.type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        price: plan.price,
      };

      console.log("Sending membership registration:", membershipData);

      let endpoint = "http://localhost:5000/api/memberships";
      let method = "POST";

      // If upgrading, use PUT method instead and include current membership ID
      if (isUpgrade && currentMembership) {
        endpoint = `http://localhost:5000/api/memberships/upgrade/${currentMembership.id}`;
        method = "PUT";
      }

      console.log(`Making ${method} request to ${endpoint}`);

      const response = await axios({
        method: method,
        url: endpoint,
        data: membershipData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Membership registration response:", response.data);

      // Clear upgrade data from localStorage
      if (isUpgrade) {
        localStorage.removeItem("currentMembership");
      }

      if (!response.data.membership || !response.data.membership._id) {
        throw new Error("Invalid membership response from server");
      }

      // Lưu thông tin membership vào localStorage để trang thanh toán có thể truy cập
      localStorage.setItem(
        "pendingMembership",
        JSON.stringify({
          id: response.data.membership._id,
          type: plan.type,
          price: plan.price,
          name: plan.name,
          duration: plan.duration,
          isUpgrade: isUpgrade,
        })
      );

      // Navigate directly to payment page
      navigate("/payment", {
        state: {
          fromMembership: true,
          isUpgrade: isUpgrade,
          membershipId: response.data.membership._id,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      // Get detailed error information
      const errorDetail =
        error.response?.data?.message ||
        error.message ||
        "Đăng ký thất bại. Vui lòng thử lại sau.";

      // Use toast instead of message state
      setToast({
        message: errorDetail,
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Compact Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20"
        >
          <Cherry className="h-12 w-12 text-pink-200 opacity-20" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute top-32 right-16"
        >
          <Mountain className="h-14 w-14 text-indigo-200 opacity-15" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
          className="absolute bottom-32 left-1/4"
        >
          <Waves className="h-10 w-10 text-cyan-200 opacity-25" />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 right-12"
        >
          <Flower2 className="h-10 w-10 text-rose-200 opacity-20" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -10, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-20 right-1/4"
        >
          <Leaf className="h-16 w-16 text-green-200 opacity-30" />
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute top-3/4 left-12"
        >
          <Sun className="h-10 w-10 text-yellow-200 opacity-15" />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 8,
          }}
          className="absolute top-1/4 left-1/3"
        >
          <Moon className="h-8 w-8 text-purple-200 opacity-20" />
        </motion.div>
      </div>

      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 pt-24 pb-12">
        {/* Compact Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"></div>

            <div className="flex items-center justify-center mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg"
              >
                <Crown className="h-6 w-6 text-white" />
              </motion.div>
              <div className="text-left">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-3"
                >
                  {isUpgrade ? "Nâng Cấp Thẻ" : "Thẻ Thành Viên"}
                </motion.h1>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                ></motion.div>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8"
            >
              Trở thành thành viên của chúng tôi để tận hưởng trải nghiệm tập
              luyện tốt nhất cùng nhiều ưu đãi hấp dẫn và dịch vụ cao cấp.
            </motion.p>

            {/* Enhanced Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center items-center flex-wrap gap-8 pt-8 border-t border-gray-200"
            >
              {[
                {
                  icon: Star,
                  text: "4.9★ Đánh giá",
                  color: "from-yellow-400 to-orange-400",
                  bgColor: "bg-yellow-50",
                  textColor: "text-yellow-700",
                },
                {
                  icon: Shield,
                  text: "Chứng nhận ISO",
                  color: "from-blue-400 to-cyan-400",
                  bgColor: "bg-blue-50",
                  textColor: "text-blue-700",
                },
                {
                  icon: Users,
                  text: "2000+ Thành viên",
                  color: "from-purple-400 to-pink-400",
                  bgColor: "bg-purple-50",
                  textColor: "text-purple-700",
                },
                {
                  icon: Heart,
                  text: "Tin tưởng #1",
                  color: "from-red-400 to-pink-400",
                  bgColor: "bg-red-50",
                  textColor: "text-red-700",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className={`${item.bgColor} rounded-xl px-4 py-2 flex items-center space-x-2 shadow-md border border-white/50 hover:scale-105 transition-transform duration-300`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}
                  >
                    <item.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className={`text-xs font-semibold ${item.textColor}`}>
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Compact Message Display */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-6 p-4 rounded-xl backdrop-blur-sm border-2 ${
              message.type === "success"
                ? "bg-green-50/90 text-green-700 border-green-200"
                : "bg-red-50/90 text-red-700 border-red-200"
            } shadow-lg`}
          >
            <div className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                  message.type === "success" ? "bg-green-200" : "bg-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
              </div>
              <span className="font-medium text-sm">{message.text}</span>
            </div>
          </motion.div>
        )}

        {/* Compact PricingPlans Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 mb-12 relative overflow-hidden"
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-indigo-50/30 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-800 mb-3"
              >
                Chọn Gói Thành Viên Phù Hợp
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-gray-600 max-w-3xl mx-auto"
              >
                Mỗi gói đều được thiết kế để mang đến trải nghiệm tốt nhất
              </motion.p>
            </div>

            <PricingPlans
              selectedPlan={selectedPlan}
              onSelectPlan={handleSelectPlan}
              filterCategory={filterCategory}
              onFilterChange={setFilterCategory}
              message={message}
              isUpgrade={isUpgrade}
              containerClassName="pricing-plans-equal-height"
            />
          </div>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid lg:grid-cols-2 gap-12 mb-20"
        >
          {/* Why Choose Us Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 group-hover:from-blue-50/50 group-hover:to-cyan-50/50 transition-all duration-500"></div>

            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">
                  Tại Sao Chọn Chúng Tôi?
                </h3>
              </div>

              <div className="space-y-6">
                {[
                  { text: "Trang thiết bị hiện đại nhất", icon: Zap },
                  { text: "Huấn luyện viên chuyên nghiệp", icon: Award },
                  { text: "Không gian tập luyện rộng rãi", icon: Users },
                  { text: "Chương trình đa dạng", icon: BookOpen },
                  { text: "Hỗ trợ 24/7", icon: Heart },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl border border-white/30 hover:bg-white/70 transition-all duration-300 group/item"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium text-lg">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Our Commitment Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-pink-50/30 group-hover:from-purple-50/50 group-hover:to-pink-50/50 transition-all duration-500"></div>

            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">
                  Cam Kết Của Chúng Tôi
                </h3>
              </div>

              <div className="space-y-6">
                {[
                  {
                    text: "Hoàn tiền 100% nếu không hài lòng",
                    icon: CheckCircle,
                  },
                  { text: "Đảm bảo an toàn tuyệt đối", icon: Shield },
                  { text: "Chế độ bảo hành thiết bị", icon: Timer },
                  { text: "Tư vấn miễn phí trọn đời", icon: Heart },
                  {
                    text: "Ưu đãi đặc biệt cho thành viên lâu năm",
                    icon: Gift,
                  },
                ].map((commitment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl border border-white/30 hover:bg-white/70 transition-all duration-300 group/item"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                      <commitment.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-gray-700 font-medium text-lg">
                      {commitment.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-orange-50/30"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-800">
                Câu Hỏi Thường Gặp
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  question: "Làm thế nào để gia hạn thẻ thành viên?",
                  answer:
                    'Bạn có thể gia hạn thẻ thành viên bằng cách đăng nhập vào tài khoản và chọn phần "Thẻ thành viên" trong hồ sơ cá nhân, sau đó chọn "Gia hạn" và làm theo hướng dẫn.',
                },
                {
                  question:
                    "Tôi có thể chuyển nhượng thẻ tập cho người khác không?",
                  answer:
                    "Các gói Cao Cấp và Đặc Quyền cho phép 1 lần chuyển nhượng miễn phí cho người thân trong gia đình. Các gói khác sẽ tính phí chuyển nhượng là 10% giá trị còn lại của gói tập.",
                },
                {
                  question: "Có hình thức trả góp cho các gói dài hạn không?",
                  answer:
                    "Có, chúng tôi liên kết với các ngân hàng đối tác để cung cấp hình thức trả góp 0% lãi suất trong 3-6 tháng cho các gói tập từ 6 tháng trở lên.",
                },
                {
                  question:
                    "Thẻ thành viên có được sử dụng ở chi nhánh khác không?",
                  answer:
                    "Có, thẻ thành viên của bạn có thể sử dụng tại tất cả các chi nhánh trong hệ thống. Bạn chỉ cần xuất trình thẻ hoặc ứng dụng mobile để check-in.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 hover:bg-white/90 hover:shadow-xl transition-all duration-300 group"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <ConfirmationDialog
            selectedPlan={selectedPlan}
            onClose={() => setShowConfirmation(false)}
            onConfirm={confirmRegistration}
            isUpgrade={isUpgrade}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
