import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Crown,
  ArrowRight,
  Shield,
  Clock,
  Users,
  Star,
  Sparkles,
  Target,
  Heart,
  Award,
  CheckCircle,
  MapPin,
  Dumbbell,
  Activity,
  Zap,
  Cherry,
  Mountain,
  Waves,
  Flame,
  Gem,
  Flower2,
} from "lucide-react";

export default function ServicePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/services");
        setServices(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ:", error);
        setServices([
          {
            id: 1,
            name: "Huấn Luyện Zen Cá Nhân",
            category: "training",
            description:
              "Huấn luyện cá nhân với triết lý thiền Zen - Tìm sự cân bằng giữa thể chất và tinh thần",
            image:
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
            price: "500000",
            features: [
              "Chương trình cá nhân hoá",
              "Thiền tập kết hợp",
              "Huấn luyện viên chuyên nghiệp",
            ],
            icon: <Target className="h-6 w-6" />,
          },
          {
            id: 2,
            name: "Lớp Học Nhóm Sakura",
            category: "classes",
            description:
              "Các lớp học nhóm đầy năng lượng: Yoga, Pilates và các bài tập truyền thống Nhật Bản",
            image:
              "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
            price: "200000",
            features: [
              "Nhiều lớp học đa dạng",
              "Cộng đồng thân thiện",
              "Giáo viên có chứng chỉ",
            ],
            icon: <Users className="h-6 w-6" />,
          },
          {
            id: 3,
            name: "Dinh Dưỡng Kaizen",
            category: "nutrition",
            description:
              "Tư vấn dinh dưỡng theo triết lý Kaizen - Cải thiện liên tục từng ngày",
            image:
              "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
            price: "300000",
            features: [
              "Kế hoạch dinh dưỡng cá nhân",
              "Theo dõi tiến độ",
              "Tư vấn 24/7",
            ],
            icon: <Heart className="h-6 w-6" />,
          },
          {
            id: 4,
            name: "Chăm Sóc Wabi-Sabi",
            category: "wellness",
            description:
              "Dịch vụ chăm sóc toàn diện - Tìm vẻ đẹp trong sự không hoàn hảo của cơ thể",
            image:
              "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
            price: "400000",
            features: ["Massage thư giãn", "Spa trị liệu", "Thiền mindfulness"],
            icon: <Flower2 className="h-6 w-6" />,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const categories = [
    { id: "all", name: "Tất Cả", icon: <Sparkles className="h-5 w-5" /> },
    {
      id: "training",
      name: "Huấn Luyện",
      icon: <Dumbbell className="h-5 w-5" />,
    },
    { id: "classes", name: "Lớp Học", icon: <Users className="h-5 w-5" /> },
    {
      id: "nutrition",
      name: "Dinh Dưỡng",
      icon: <Heart className="h-5 w-5" />,
    },
    { id: "wellness", name: "Chăm Sóc", icon: <Flower2 className="h-5 w-5" /> },
  ];

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((service) => service.category === selectedCategory);

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "An Tâm Tuyệt Đối",
      subtitle: "Anshin (安心)",
      description:
        "Chất lượng dịch vụ được đảm bảo với tiêu chuẩn Nhật Bản nghiêm ngặt",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: <Gem className="h-8 w-8" />,
      title: "Tinh Tế Hoàn Hảo",
      subtitle: "Shokunin (職人)",
      description:
        "Từng chi tiết được chăm chút tỉ mỉ với tinh thần nghệ nhân Nhật Bản",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: <Mountain className="h-8 w-8" />,
      title: "Bền Vững Lâu Dài",
      subtitle: "Kaizen (改善)",
      description:
        "Phương pháp cải tiến liên tục mang lại kết quả bền vững theo thời gian",
      color: "from-green-500 to-emerald-600",
    },
  ];

  const stats = [
    {
      number: "万人",
      translation: "10K+",
      label: "Khách Hàng Tin Tưởng",
      icon: <Users className="h-8 w-8" />,
      color: "from-pink-400 to-rose-500",
    },
    {
      number: "十五",
      translation: "15+",
      label: "Chi Nhánh Toàn Quốc",
      icon: <MapPin className="h-8 w-8" />,
      color: "from-blue-400 to-cyan-500",
    },
    {
      number: "百人",
      translation: "100+",
      label: "Chuyên Gia Hàng Đầu",
      icon: <Award className="h-8 w-8" />,
      color: "from-amber-400 to-orange-500",
    },
    {
      number: "五星",
      translation: "5★",
      label: "Đánh Giá Xuất Sắc",
      icon: <Star className="h-8 w-8" />,
      color: "from-yellow-400 to-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-pink-50">
      {/* Floating Japanese Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10"
        >
          <Cherry className="h-16 w-16 text-pink-300 opacity-40" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute top-40 right-20"
        >
          <Mountain className="h-20 w-20 text-blue-300 opacity-30" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
          className="absolute bottom-40 left-1/4"
        >
          <Waves className="h-14 w-14 text-cyan-300 opacity-35" />
        </motion.div>
      </div>

      {/* Hero Section - Japanese Zen Style */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-gray-900/70 to-indigo-900/60 z-10" />

        {/* Japanese Pattern Overlay */}
        <div className="absolute inset-0 z-15 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 border-2 border-pink-300/50 rounded-none rotate-45 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-32 h-32 border-2 border-blue-300/50 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 border-2 border-green-300/50 rotate-12 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-20 max-w-[1400px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            {/* Japanese Title */}
            <div className="mb-8">
              <div className="text-6xl md:text-8xl font-light text-white mb-4 tracking-wider font-serif">
                <span className="text-pink-400">サービス</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-light text-white mb-6">
                <span className="text-blue-400">Dịch</span>
                <span className="mx-4 text-yellow-400">•</span>
                <span className="text-pink-400">Vụ</span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-6 mb-12">
              <p className="text-xl md:text-3xl text-white/90 font-light font-serif">
                おもてなしの心
              </p>
              <p className="text-lg md:text-xl text-white/80 mb-4">
                Tinh Thần Phục Vụ Từ Trái Tim
              </p>
              <p className="text-base text-white/70 max-w-3xl mx-auto leading-relaxed">
                Khám phá những dịch vụ được thiết kế với triết lý Omotenashi -
                tinh thần hiếu khách Nhật Bản, nơi mỗi chi tiết đều được chăm
                chút để mang đến trải nghiệm hoàn hảo
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  document.getElementById("services-section")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="px-8 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group whitespace-nowrap"
              >
                <Cherry className="inline mr-3 h-5 w-5" />
                <span>Khám Phá Dịch Vụ</span>
                <ArrowRight className="inline ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <Link to="/membership">
                <motion.button
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap"
                >
                  <Crown className="inline mr-3 h-5 w-5" />
                  <span>Đăng Ký Thành Viên</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Categories Filter */}
      <section className="py-12 bg-white/80 backdrop-blur-sm border-y border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-pink-300 hover:text-pink-600"
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        className="py-10 bg-gradient-to-br from-white via-pink-50 to-blue-50"
        id="services-section"
      >
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-20">
            <div className="text-4xl md:text-5xl text-gray-800 mb-4 font-serif">
              私たちのサービス
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
              Khám Phá Các Dịch Vụ Của Chúng Tôi
            </h2>
            <p className="text-pink-500 font-medium tracking-wider mb-4 uppercase text-sm">
              Chất Lượng Nhật Bản
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Mỗi dịch vụ đều được thiết kế với tinh thần Monozukuri - nghệ
              thuật tạo ra sản phẩm hoàn hảo
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-gray-600">Đang tải dịch vụ...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-6">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -15 }}
                  className="h-full group"
                >
                  <Link
                    to={`/services/detail/${service.slug || service.id}`}
                    className="block h-full"
                  >
                    <div className="bg-white rounded-2xl overflow-hidden h-full shadow-lg hover:shadow-2xl transition-all duration-700 group-hover:transform group-hover:scale-105 border border-gray-100 flex flex-col">
                      {/* Image Section */}
                      <div className="relative overflow-hidden h-56">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800";
                          }}
                        />

                        {/* Japanese Pattern Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Service Category Badge */}
                        <div className="absolute top-4 left-4">
                          <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-md whitespace-nowrap">
                            {service.icon}
                            <span className="ml-2">
                              {categories.find(
                                (cat) => cat.id === service.category
                              )?.name || "Dịch Vụ"}
                            </span>
                          </div>
                        </div>

                        {/* Premium Badge */}
                        <div className="absolute top-4 right-4">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-md whitespace-nowrap">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Cao Cấp
                          </div>
                        </div>

                        {/* Hover Action */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100 shadow-lg">
                            <ArrowRight className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 space-y-4 flex-grow flex flex-col">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-pink-600 transition-colors mb-2">
                            {service.name}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {service.description}
                          </p>
                        </div>

                        {/* Features */}
                        {service.features && (
                          <div className="space-y-2 flex-grow">
                            {service.features
                              .slice(0, 3)
                              .map((feature, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center text-xs text-gray-600"
                                >
                                  <CheckCircle className="h-3 w-3 text-pink-500 mr-2 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                          <div className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center whitespace-nowrap">
                            <span>Xem Chi Tiết</span>
                            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>

                          {service.price && (
                            <div className="text-pink-600 font-bold text-sm whitespace-nowrap">
                              {typeof service.price === "number"
                                ? service.price.toLocaleString("vi-VN") + "đ"
                                : parseInt(service.price).toLocaleString(
                                    "vi-VN"
                                  ) + "đ"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Why Choose Us */}
      <section className="py-10 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="relative max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-20">
            <div className="text-4xl md:text-5xl text-white mb-4 font-serif">
              なぜ選ぶのか
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Tại Sao Chọn Chúng Tôi?
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mb-6"></div>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Chúng tôi mang đến sự khác biệt với triết lý và chất lượng dịch vụ
              Nhật Bản
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-500 h-full">
                  {/* Icon with gradient background */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>

                  {/* Japanese subtitle */}
                  <div className="text-2xl text-pink-300 mb-2 font-serif">
                    {feature.subtitle}
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative element */}
                  <div className="absolute top-6 right-6 w-8 h-8 border border-pink-300/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-white">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-4xl md:text-5xl text-gray-800 mb-4 font-serif">
              実績
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
              Những Con Số Ấn Tượng
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-6">
              Minh chứng cho chất lượng dịch vụ và sự tin tưởng của khách hàng
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 group-hover:transform group-hover:scale-105">
                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-full text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {stat.icon}
                  </div>

                  {/* Japanese Number */}
                  <div className="text-3xl text-gray-800 mb-2 group-hover:text-pink-600 transition-colors font-serif">
                    {stat.number}
                  </div>

                  {/* Translation */}
                  <div className="text-2xl font-bold text-pink-600 mb-2">
                    {stat.translation}
                  </div>

                  {/* Label */}
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <Cherry className="absolute top-20 left-10 h-12 w-12 text-pink-300 opacity-40" />
          <Mountain className="absolute bottom-20 right-10 h-16 w-16 text-blue-300 opacity-30" />
          <Waves className="absolute top-1/2 left-1/4 h-10 w-10 text-cyan-300 opacity-35" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-4xl md:text-5xl text-gray-800 mb-4 font-serif">
              始めましょう
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
              Sẵn Sàng Bắt Đầu Hành Trình?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
              Hãy để chúng tôi đồng hành cùng bạn trong việc khám phá và trải
              nghiệm những dịch vụ tuyệt vời với chất lượng Nhật Bản
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/membership">
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group whitespace-nowrap"
                >
                  <Crown className="inline mr-3 h-6 w-6" />
                  <span>Đăng Ký Ngay</span>
                  <Sparkles className="inline ml-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                </motion.button>
              </Link>

              <Link to="/club">
                <motion.button
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group whitespace-nowrap"
                >
                  <span>Tham Quan Cơ Sở</span>
                  <ArrowRight className="inline ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
