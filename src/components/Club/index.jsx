import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PricingPlans from "../PricingPlans";
import Toast from "../common/Toast";
import {
  MapPin,
  Star,
  Crown,
  ArrowRight,
  X,
  CheckCircle,
  Cherry,
  Mountain,
  Waves,
  Sparkles,
  Heart,
  Shield,
  Award,
} from "lucide-react";

export default function Club() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showMembershipSection, setShowMembershipSection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [membershipMessage, setMembershipMessage] = useState({
    text: "",
    type: "",
  });
  const [filterCategory, setFilterCategory] = useState("all");
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/clubs");
        setClubs(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách CLB:", error);
        // Fallback data nếu API không hoạt động
        setClubs([
          {
            id: 1,
            name: "Royal Fitness Premium",
            address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
            description:
              "Câu lạc bộ cao cấp với trang thiết bị hiện đại và dịch vụ 5 sao",
            image:
              "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
          },
          {
            id: 2,
            name: "Royal Fitness Elite",
            address: "456 Lê Văn Việt, Quận 9, TP.HCM",
            description:
              "Không gian tập luyện sang trọng với huấn luyện viên chuyên nghiệp",
            image:
              "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800",
          },
          {
            id: 3,
            name: "Royal Fitness Zen",
            address: "789 Võ Văn Tần, Quận 3, TP.HCM",
            description: "Kết hợp triết lý phương Đông với công nghệ hiện đại",
            image:
              "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // Sửa lỗi localStorage - Kiểm tra environment và handle errors
  useEffect(() => {
    const initializeAuth = () => {
      // Kiểm tra xem có đang trong browser environment không
      if (typeof window === "undefined") return;

      try {
        // Kiểm tra localStorage có available không
        if (!window.localStorage) {
          console.warn("localStorage không khả dụng");
          return;
        }

        const token = localStorage.getItem("token");
        if (token && token !== "undefined" && token !== "null") {
          try {
            const decoded = jwtDecode(token);
            // Kiểm tra token có hết hạn không
            if (decoded.exp && decoded.exp * 1000 > Date.now()) {
              setUserId(decoded.userId);
              setIsLoggedIn(true);
            } else {
              // Token hết hạn, xóa khỏi localStorage
              localStorage.removeItem("token");
            }
          } catch (jwtError) {
            console.warn("Token không hợp lệ:", jwtError);
            // Xóa token không hợp lệ
            localStorage.removeItem("token");
          }
        }
      } catch (storageError) {
        console.warn("Lỗi truy cập localStorage:", storageError);
        // Fallback: sử dụng session state
        setIsLoggedIn(false);
        setUserId(null);
      }
    };

    // Chờ component mount hoàn toàn
    const timeoutId = setTimeout(initializeAuth, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const openClubDetails = (club) => {
    setSelectedClub(club);
  };

  const closeClubDetails = () => {
    setSelectedClub(null);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const clubImages = [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920",
  ];

  const clubFeatures = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "An Toàn Tuyệt Đối",
      description: "Hệ thống bảo mật và vệ sinh đạt chuẩn quốc tế",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Chất Lượng Hàng Đầu",
      description: "Trang thiết bị hiện đại nhập khẩu từ châu Âu",
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Dịch Vụ Tận Tâm",
      description: "Đội ngũ nhân viên chuyên nghiệp, tận tình",
    },
  ];

  const clubEquipments = [
    "Máy tập hiện đại nhập khẩu từ Mỹ",
    "Phòng tập rộng rãi, thoáng mát",
    "Khu vực cardio riêng biệt",
    "Phòng tập yoga chuyên biệt",
    "Hệ thống âm thanh ánh sáng hiện đại",
    "Khu vực thay đồ sang trọng",
  ];

  const clubServices = [
    "Huấn luyện viên cá nhân chuyên nghiệp",
    "Các lớp học nhóm đa dạng",
    "Tư vấn dinh dưỡng miễn phí",
    "Spa & massage thư giãn",
    "Căng tin thực phẩm healthy",
    "Dịch vụ giữ trẻ an toàn",
  ];

  const handleScrollToClubs = () => {
    try {
      const element = document.getElementById("clubs-section");
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } catch (error) {
      console.warn("Scroll error:", error);
    }
  };

  // Safe image handler
  const handleImageError = (e) => {
    e.target.src =
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Elements - Japanese Aesthetic */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10"
        >
          <Cherry className="h-12 w-12 text-pink-400 opacity-30" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-40 right-20"
        >
          <Mountain className="h-16 w-16 text-blue-400 opacity-20" />
        </motion.div>
      </div>

      {/* Toast notification - Conditional rendering */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      )}

      {/* Hero Section - Japanese Zen Style */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with Japanese overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${clubImages[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-gray-900/70 to-blue-900/60 z-10" />

        {/* Geometric Overlay - Japanese Pattern */}
        <div className="absolute inset-0 z-15">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-pink-300/30 rounded-none rotate-45 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 border border-blue-300/30 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/4 w-20 h-20 border border-green-300/30 rotate-12 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-20 max-w-[1400px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Hero Title */}
            <div className="relative mb-8">
              <h1 className="text-5xl md:text-7xl font-light text-white mb-4">
                <span className="text-pink-400">Royal</span>
                <span className="mx-4 text-yellow-400">•</span>
                <span className="text-blue-400">Fitness</span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-6 mb-12">
              <p className="text-xl md:text-2xl text-white/90 font-light italic">
                Chinh phục đỉnh cao sức khỏe cùng chúng tôi
              </p>
              <p className="text-lg md:text-xl text-white/80">
                Nơi giao thoa giữa truyền thống và hiện đại
              </p>
              <p className="text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
                Khám phá hệ thống câu lạc bộ hiện đại với triết lý phương Đông,
                nơi bạn không chỉ rèn luyện thể chất mà còn tìm thấy sự cân bằng
                trong tâm hồn
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleScrollToClubs}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Cherry className="inline mr-3 h-5 w-5" />
                <span>Khám Phá Câu Lạc Bộ</span>
                <ArrowRight className="inline ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <Link to="/membership">
                <motion.button
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Crown className="inline mr-3 h-5 w-5" />
                  <span>Đăng Ký Thành Viên</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section-spacing py-10 bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-800 mb-6">
              Tại Sao Chọn Chúng Tôi?
            </h2>
            <p className="text-pink-500 font-medium tracking-wider mb-4 uppercase text-sm">
              Điểm Khác Biệt
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Sự hòa quyện hoàn hảo giữa triết lý phương Đông và công nghệ hiện
              đại, tạo nên trải nghiệm tập luyện độc đáo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {clubFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 text-center h-full shadow-lg hover:shadow-xl transition-all duration-500 group-hover:transform group-hover:scale-105 border border-gray-100">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Club List Section */}
      <section
        className="club-section section-spacing py-10 bg-white"
        id="clubs-section"
      >
        <div className="club-container max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-gray-800 mb-6">
              Khám Phá Các Câu Lạc Bộ
            </h2>
            <p className="text-blue-500 font-medium tracking-wider mb-4 uppercase text-sm">
              Hệ Thống Cơ Sở
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Mỗi câu lạc bộ đều được thiết kế với không gian thiền định và
              trang thiết bị hiện đại, mang đến trải nghiệm tập luyện tuyệt vời
            </p>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto mt-8"></div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-pink-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-gray-600">
                  Đang tải danh sách câu lạc bộ...
                </p>
              </div>
            </div>
          ) : (
            <div className="club-grid">
              {clubs.map((club, index) => (
                <motion.div
                  key={club.id || `club-${index}`}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="club-card-wrapper"
                >
                  <div className="club-card group h-full">
                    <div className="bg-white rounded-2xl overflow-hidden h-full shadow-lg hover:shadow-2xl transition-all duration-700 border border-gray-100">
                      {/* Image Section */}
                      <div className="relative overflow-hidden h-64">
                        <img
                          src={club.image}
                          alt={club.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          onError={handleImageError}
                          style={{ borderRadius: "inherit" }} // Kế thừa border radius
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Status Indicator */}
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white font-medium text-sm">
                              Đang hoạt động
                            </span>
                          </div>
                        </div>

                        {/* Pattern Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-blue-500 to-green-500 opacity-80"></div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-pink-600 transition-colors flex-1">
                            {club.name}
                          </h3>
                          <div className="flex ml-4">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={`star-${i}`}
                                className="h-4 w-4 text-yellow-400 fill-current"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-pink-500" />
                          <span className="text-sm">{club.address}</span>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed">
                          {club.description}
                        </p>

                        <div className="pt-4 space-y-3 border-t border-gray-100">
                          <button
                            onClick={() => openClubDetails(club)}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 group flex items-center justify-center"
                          >
                            <span>Xem Chi Tiết</span>
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </button>

                          <Link to="/membership" className="block">
                            <button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                              <Crown className="h-4 w-4 mr-2" />
                              <span>Đăng Ký Ngay</span>
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Membership Section */}
      <section className="membership-section py-10 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-800 mb-6">
              Gói Thành Viên
            </h2>
            <p className="text-blue-500 font-medium tracking-wider mb-4 uppercase text-sm">
              Chọn Gói Phù Hợp
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Lựa chọn gói tập phù hợp với lối sống và mục tiêu của bạn, từ cơ
              bản đến cao cấp với nhiều ưu đãi hấp dẫn
            </p>

            {!showMembershipSection ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-12"
              >
                <button
                  onClick={() => setShowMembershipSection(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Sparkles className="inline mr-3 h-5 w-5" />
                  <span>Xem Các Gói Thành Viên</span>
                  <ArrowRight className="inline ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ) : null}
          </div>

          {showMembershipSection && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <PricingPlans
                  selectedPlan={selectedPlan}
                  onSelectPlan={handleSelectPlan}
                  filterCategory={filterCategory}
                  onFilterChange={setFilterCategory}
                  message={membershipMessage}
                  readOnly={true}
                />

                <div className="text-center mt-12 pt-8 border-t border-gray-100">
                  <Link to="/membership">
                    <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <Crown className="inline mr-3 h-5 w-5" />
                      <span>Đăng Ký Thành Viên Ngay</span>
                      <ArrowRight className="inline ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Club Details Modal */}
      {selectedClub && (
        <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 mt">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="modal-content bg-white rounded-2xl max-w-4xl w-full"
          >
            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <h2 className="text-3xl font-light text-gray-800">
                  {selectedClub.name}
                </h2>
                <button
                  onClick={closeClubDetails}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* Hero Image */}
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={selectedClub.image}
                  alt={selectedClub.name}
                  className="w-full h-80 object-cover"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center text-white">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="font-medium">{selectedClub.address}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Giới Thiệu
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedClub.description}. Với không gian hiện đại và đội ngũ
                  chuyên nghiệp, chúng tôi cam kết mang đến cho bạn trải nghiệm
                  tập luyện tuyệt vời nhất.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Trang Thiết Bị
                  </h3>
                  <div className="space-y-3">
                    {clubEquipments.map((item, index) => (
                      <div
                        key={`equipment-${index}`}
                        className="flex items-start"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100">
                  <h3 className="text-lg font-semibold text-pink-600 mb-4 flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Dịch Vụ
                  </h3>
                  <div className="space-y-3">
                    {clubServices.map((item, index) => (
                      <div
                        key={`service-${index}`}
                        className="flex items-start"
                      >
                        <CheckCircle className="h-5 w-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Ưu Đãi Đặc Biệt
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
                  <div>• Miễn phí tư vấn dinh dưỡng cho thành viên mới</div>
                  <div>• Giảm giá 20% gói PT trong tháng đầu</div>
                  <div>• Free trial 3 ngày cho khách hàng mới</div>
                  <div>• Tặng áo thun Royal Fitness khi đăng ký</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={closeClubDetails}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
                <Link to="/membership" className="flex-1">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                    <Crown className="mr-2 h-4 w-4" />
                    <span>Đăng Ký Thành Viên</span>
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="floating-button fixed bottom-8 right-8 z-40"
      >
        <Link to="/membership">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg flex items-center justify-center group hover:shadow-xl transition-all duration-300"
          >
            <Crown className="h-8 w-8 group-hover:scale-110 transition-transform" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
