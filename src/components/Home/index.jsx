import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Crown,
  Dumbbell,
  Users,
  Calendar,
  Award,
  Star,
  Play,
  ArrowRight,
  Heart,
  Trophy,
  Target,
  CheckCircle,
  Mountain,
  Cherry,
  Waves,
  Sparkles,
  Zap,
  Flame,
  Shield,
  Rocket,
  Diamond,
  Gem,
} from "lucide-react";

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/services");
        setServices(response.data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([
          {
            id: 1,
            title: "Gym & Fitness",
            image:
              "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
          },
          {
            id: 2,
            title: "Yoga & Pilates",
            image:
              "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800",
          },
          {
            id: 3,
            title: "Personal Training",
            image:
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
          },
          {
            id: 4,
            title: "Group Classes",
            image:
              "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
          },
        ]);
      }
    };

    fetchServices();
  }, []);

  const servicesPerPage = 4;

  const handleScroll = (direction) => {
    if (direction === "left") {
      setCurrentIndex((prev) =>
        prev === 0
          ? Math.max(services.length - servicesPerPage, 0)
          : prev - servicesPerPage
      );
    } else {
      setCurrentIndex((prev) =>
        prev + servicesPerPage >= services.length ? 0 : prev + servicesPerPage
      );
    }
  };

  const displayedServices = services.slice(
    currentIndex,
    currentIndex + servicesPerPage
  );

  const features = [
    {
      icon: <Diamond className="h-12 w-12" />,
      title: "Dịch Vụ Cao Cấp",
      subtitle: "Premium Service",
      description:
        "Trải nghiệm tối thượng với cơ sở vật chất hiện đại và không gian sang trọng, mang đến cho bạn những phút giây tập luyện hoàn hảo nhất.",
      gradient: "from-pink-400 via-rose-500 to-red-600",
      glowColor: "pink",
    },
    {
      icon: <Rocket className="h-12 w-12" />,
      title: "Huấn Luyện Viên Chuyên Nghiệp",
      subtitle: "Expert Trainers",
      description:
        "Đội ngũ huấn luyện viên giàu kinh nghiệm và tận tâm, luôn đồng hành cùng bạn trên hành trình chinh phục mục tiêu sức khỏe và thể hình.",
      gradient: "from-blue-400 via-indigo-500 to-purple-600",
      glowColor: "blue",
    },
    {
      icon: <Flame className="h-12 w-12" />,
      title: "Lịch Trình Linh Hoạt",
      subtitle: "Flexible Schedule",
      description:
        "Hệ thống lớp học đa dạng với thời gian linh hoạt, phù hợp với lối sống bận rộn của bạn, giúp việc tập luyện trở nên dễ dàng hơn bao giờ hết.",
      gradient: "from-green-400 via-emerald-500 to-teal-600",
      glowColor: "green",
    },
    {
      icon: <Gem className="h-12 w-12" />,
      title: "Chất Lượng Được Công Nhận",
      subtitle: "Certified Quality",
      description:
        "Được đánh giá cao bởi cộng đồng và các chuyên gia trong ngành thể hình, chúng tôi tự hào về chất lượng dịch vụ xuất sắc.",
      gradient: "from-yellow-400 via-orange-500 to-red-500",
      glowColor: "yellow",
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Thị Hoa",
      role: "Thành viên VIP",
      content:
        "Royal Fitness đã thay đổi hoàn toàn cuộc sống của tôi. Cơ sở vật chất sang trọng và dịch vụ tận tâm khiến tôi hoàn toàn hài lòng.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      cardGradient: "from-pink-100 via-rose-100 to-red-50",
      accentColor: "pink",
    },
    {
      name: "Trần Văn Nam",
      role: "Thành viên Premium",
      content:
        "Không gian yên tĩnh, thiết bị hiện đại. Tập luyện ở đây thực sự giúp tôi cảm thấy thư giãn và tràn đầy năng lượng.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      cardGradient: "from-blue-100 via-indigo-100 to-purple-50",
      accentColor: "blue",
    },
    {
      name: "Phạm Thị Lan",
      role: "Thành viên Gold",
      content:
        "Đội ngũ huấn luyện viên nhiệt tình và chương trình tập luyện hoàn hảo. Kết quả thật sự rõ rệt và vượt ngoài mong đợi!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      cardGradient: "from-green-100 via-emerald-100 to-teal-50",
      accentColor: "green",
    },
  ];

  const trainers = [
    {
      name: "Nguyễn Văn Mạnh",
      specialty: "Strength & Conditioning",
      image:
        "https://images.unsplash.com/photo-1567013127542-490d757e6349?w=400",
      experience: "8 năm kinh nghiệm",
      accentColor: "red",
    },
    {
      name: "Trần Thị Hương",
      specialty: "Yoga & Pilates",
      image:
        "https://images.unsplash.com/photo-1642914459698-593897ca5118?w=400",
      experience: "10 năm kinh nghiệm",
      accentColor: "purple",
    },
    {
      name: "Lê Minh Tuấn",
      specialty: "Personal Training",
      image:
        "https://images.unsplash.com/photo-1522075782449-e45a34f1ddfb?w=400",
      experience: "7 năm kinh nghiệm",
      accentColor: "green",
    },
    {
      name: "Phạm Thị Mai",
      specialty: "Group Fitness",
      image:
        "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=400",
      experience: "6 năm kinh nghiệm",
      accentColor: "orange",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Floating Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-green-500/25 to-emerald-500/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Hero Section - Completely Redesigned */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `linear-gradient(45deg, rgba(139, 69, 19, 0.8), rgba(75, 0, 130, 0.8), rgba(0, 100, 0, 0.8)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920)`,
            }}
          />
        </div>

        {/* Geometric Shapes */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-pink-500/40 to-red-500/40 rotate-45 rounded-3xl animate-bounce"></div>
          <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-green-500/30 to-teal-500/30 rotate-12 rounded-2xl animate-bounce delay-1000"></div>
        </div>

        <div className="relative z-20 max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Main Title with 3D Effect */}
            <div className="relative mb-8">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent mb-4 transform hover:scale-105 transition-transform duration-500 filter drop-shadow-2xl">
                ROYAL FITNESS
              </h1>
              <div className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-black text-white/5 transform translate-x-2 translate-y-2 -z-10">
                ROYAL FITNESS
              </div>

              {/* Floating Icons */}
              <div className="absolute -top-8 -left-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Crown className="h-16 w-16 text-yellow-400 filter drop-shadow-lg" />
                </motion.div>
              </div>

              <div className="absolute -top-4 -right-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-12 w-12 text-pink-400" />
                </motion.div>
              </div>
            </div>

            {/* Subtitle with Neon Effect */}
            <div className="relative mb-12">
              <p className="text-xl md:text-3xl lg:text-4xl text-white font-bold leading-relaxed">
                <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  Bắt đầu hành trình hoàn thiện bản thân
                </span>
                <br />
                <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                  Nơi ước mơ trở thành hiện thực
                </span>
              </p>
            </div>

            {/* CTA Buttons with Hover Effects */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/services">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-10 py-5 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white font-bold text-xl rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-3">
                    <Zap className="h-7 w-7 group-hover:animate-bounce" />
                    <span>KHÁM PHÁ NGAY</span>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.button>
              </Link>

              <Link to="/membership">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-10 py-5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white font-bold text-xl rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-3">
                    <Diamond className="h-7 w-7 group-hover:animate-spin" />
                    <span>THÀNH VIÊN VIP</span>
                    <Crown className="h-6 w-6 group-hover:animate-bounce" />
                  </div>
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center"
            >
              <div className="w-1 h-3 bg-white/70 rounded-full mt-3"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated Elements */}
        <div className="absolute top-1/4 left-10 z-15">
          <motion.div
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Dumbbell className="h-16 w-16 text-pink-400/80 filter drop-shadow-xl" />
          </motion.div>
        </div>

        <div className="absolute top-1/3 right-10 z-15">
          <motion.div
            animate={{
              y: [0, 25, 0],
              x: [0, 15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <Heart className="h-14 w-14 text-red-400/80 filter drop-shadow-xl" />
          </motion.div>
        </div>
      </section>

      {/* Features Section - Hexagonal Grid Layout */}
      <section className="relative py-32 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-8 filter drop-shadow-2xl">
              TẠI SAO CHỌN CHÚNG TÔI?
            </h2>
            <div className="w-40 h-2 bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 to-green-500 mx-auto rounded-full shadow-lg"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 100, rotate: -10 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{
                  y: -15,
                  rotate: 5,
                  scale: 1.05,
                }}
                className="group"
              >
                <div
                  className={`relative p-8 rounded-3xl bg-gradient-to-br ${feature.gradient} shadow-2xl hover:shadow-${feature.glowColor}-500/50 transition-all duration-500 overflow-hidden`}
                >
                  {/* Geometric Background */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full"></div>

                  {/* Glowing Icon */}
                  <div className="relative z-10 mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-3xl mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl">
                      {feature.icon}
                    </div>
                  </div>

                  <div className="relative z-10 text-white">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-yellow-200 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/90 text-sm font-semibold mb-4 uppercase tracking-wider">
                      {feature.subtitle}
                    </p>
                    <p className="text-white/80 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-white/0 group-hover:border-white/30 transition-all duration-500"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Curved Layout */}
      <section className="relative py-32 bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 overflow-hidden">
        {/* Curved Separator */}
        <div className="absolute top-0 left-0 w-full overflow-hidden">
          <svg
            className="relative block w-full h-20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
          >
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              fill="rgba(139, 69, 19, 0.8)"
            ></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-8 filter drop-shadow-2xl">
              DỊCH VỤ ĐẲNG CẤP
            </h2>
            <div className="w-40 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 mx-auto rounded-full shadow-lg"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {displayedServices.map((service, index) => (
              <motion.div
                key={service._id || service.id || index}
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{
                  y: -20,
                  rotateY: 10,
                }}
                className="group perspective-1000"
              >
                <UltraServiceCard
                  id={service._id || service.id}
                  title={service.title}
                  image={service.image}
                  index={index}
                />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-20">
            <Link to="/services">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 3 }}
                whileTap={{ scale: 0.9 }}
                className="group px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold text-2xl rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <Flame className="h-8 w-8 group-hover:animate-bounce" />
                  <span>XEM TẤT CẢ DỊCH VỤ</span>
                  <ArrowRight className="h-7 w-7 group-hover:translate-x-3 transition-transform" />
                </div>
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Split with 3D Effects */}
      <section className="relative py-32 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -100, rotateY: -45 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1 }}
              className="relative group"
            >
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-3xl blur-xl transform scale-110"></div>
                <img
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800"
                  alt="Royal Fitness Interior"
                  className="relative w-full h-96 object-cover rounded-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-purple-500/30 rounded-3xl"></div>

                {/* Floating Badge */}
                <div className="absolute top-6 right-6">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    ⭐ #1 FITNESS CENTER
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-center">
                  <p className="text-white text-xl font-bold italic filter drop-shadow-lg">
                    "Không gian hiện đại, thiết bị chuẩn quốc tế"
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-8 filter drop-shadow-xl">
                  VỀ ROYAL FITNESS
                </h2>
                <p className="text-white/90 text-xl leading-relaxed">
                  Royal Fitness ra đời với sứ mệnh nâng cao sức khỏe cộng đồng,
                  cải thiện vóc dáng và rèn luyện tinh thần kỷ luật. Chúng tôi
                  tự hào sở hữu đội ngũ huấn luyện viên chuyên nghiệp cùng hệ
                  thống trang thiết bị đạt chuẩn quốc tế.
                </p>
              </div>

              {/* 3D Stats Cards */}
              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ rotateY: 15, scale: 1.05 }}
                  className="transform-gpu"
                >
                  <UltraStatsCard
                    number="1,500+"
                    label="Thành viên hài lòng"
                    gradient="from-pink-500 to-red-500"
                    icon={<Heart className="h-8 w-8" />}
                  />
                </motion.div>

                <motion.div
                  whileHover={{ rotateY: -15, scale: 1.05 }}
                  className="transform-gpu"
                >
                  <UltraStatsCard
                    number="25+"
                    label="Huấn luyện viên chuyên nghiệp"
                    gradient="from-blue-500 to-purple-500"
                    icon={<Users className="h-8 w-8" />}
                  />
                </motion.div>

                <motion.div
                  whileHover={{ rotateY: 15, scale: 1.05 }}
                  className="transform-gpu"
                >
                  <UltraStatsCard
                    number="150+"
                    label="Lớp học mỗi tuần"
                    gradient="from-green-500 to-teal-500"
                    icon={<Calendar className="h-8 w-8" />}
                  />
                </motion.div>

                <motion.div
                  whileHover={{ rotateY: -15, scale: 1.05 }}
                  className="transform-gpu"
                >
                  <UltraStatsCard
                    number="10+"
                    label="Năm kinh nghiệm"
                    gradient="from-yellow-500 to-orange-500"
                    icon={<Award className="h-8 w-8" />}
                  />
                </motion.div>
              </div>

              <div className="pt-8">
                <Link to="/club">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-10 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-bold text-xl rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      <Shield className="h-7 w-7 group-hover:animate-spin" />
                      <span>TÌM HIỂU THÊM</span>
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trainers Section - Fixed Overflow */}
      <section className="trainers-section relative py-32 bg-gradient-to-br from-red-900 via-pink-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 bg-clip-text text-transparent mb-8 filter drop-shadow-2xl">
              ĐỘI NGŨ SIÊU SAO
            </h2>
            <div className="w-40 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 mx-auto rounded-full shadow-lg"></div>
          </motion.div>

          {/* Fixed Grid Container với overflow visible */}
          <div
            className="cards-grid trainer-cards-container"
            style={{ overflow: "visible" }}
          >
            {trainers.map((trainer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 100, rotateX: -90 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="trainer-card-wrapper"
                style={{ overflow: "visible" }} // Inline style để đảm bảo
              >
                <UltraTrainerCard {...trainer} index={index} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Floating Cards */}
      <section className="relative py-32 bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-green-300 via-teal-300 to-blue-300 bg-clip-text text-transparent mb-8 filter drop-shadow-2xl">
              KHÁCH HÀNG NÓI GÌ?
            </h2>
            <div className="w-40 h-2 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 mx-auto rounded-full shadow-lg"></div>
          </motion.div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            style={{ overflow: "visible", padding: "2rem 1rem" }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="testimonial-card transform-gpu"
                style={{ overflow: "visible", padding: "1rem" }}
                initial={{
                  opacity: 0,
                  y: 100,
                  rotateZ: index % 2 === 0 ? -45 : 45,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  rotateZ: 0,
                }}
                transition={{ duration: 0.8, delay: index * 0.3 }}
                whileHover={{
                  y: -15,
                  rotateZ: index % 2 === 0 ? 3 : -3,
                  scale: 1.05,
                }}
              >
                <UltraTestimonialCard {...testimonial} index={index} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Epic Finish */}
      <section className="relative py-40 bg-gradient-to-br from-black via-purple-900 to-black overflow-hidden">
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              animate={{
                x: [0, Math.random() * 1000],
                y: [0, Math.random() * 600],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.5 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-pink-300 via-purple-300 via-blue-300 to-green-300 bg-clip-text text-transparent mb-12 filter drop-shadow-2xl">
              SẴN SÀNG THAY ĐỔI?
            </h2>

            <p className="text-2xl md:text-3xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed">
              Hãy tham gia cộng đồng Royal Fitness ngay hôm nay và cảm nhận sự
              khác biệt
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Link to="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="group relative px-16 py-8 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white font-black text-2xl rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-4">
                    <Crown className="h-10 w-10 group-hover:animate-bounce" />
                    <span>ĐĂNG KÝ NGAY</span>
                    <Rocket className="h-10 w-10 group-hover:animate-pulse" />
                  </div>
                </motion.button>
              </Link>

              <Link to="/club">
                <motion.button
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="group relative px-16 py-8 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white font-black text-2xl rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-4">
                    <Shield className="h-10 w-10 group-hover:animate-spin" />
                    <span>THÔNG TIN CLUB</span>
                    <ArrowRight className="h-10 w-10 group-hover:translate-x-3 transition-transform" />
                  </div>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Ultra Service Card Component
function UltraServiceCard({ id, title, image, index }) {
  const gradients = [
    "from-pink-500 via-red-500 to-orange-500",
    "from-purple-500 via-indigo-500 to-blue-500",
    "from-blue-500 via-cyan-500 to-teal-500",
    "from-green-500 via-emerald-500 to-teal-500",
  ];

  return (
    <Link to={`/services/detail/${id}`} className="block group">
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl hover:shadow-4xl transition-all duration-700 transform group-hover:scale-105 group-hover:rotate-2">
        {/* Image with Overlay */}
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-80 object-cover group-hover:scale-125 transition-transform duration-1000"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${
              gradients[index % gradients.length]
            } opacity-70 group-hover:opacity-50 transition-opacity duration-500`}
          />

          {/* Floating Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
            <motion.div
              whileHover={{ scale: 1.3, rotate: 180 }}
              className="w-24 h-24 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-200 shadow-2xl"
            >
              <Play className="h-12 w-12 text-white ml-2" />
            </motion.div>
          </div>

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
              #{index + 1} HOT
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-gradient-to-br from-white to-gray-50">
          <h3 className="text-3xl font-black text-gray-800 mb-4 group-hover:text-purple-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed text-lg">
            Trải nghiệm dịch vụ {title} tại Royal Fitness với chương trình tập
            luyện chuyên nghiệp và hiệu quả
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-purple-600 font-bold text-lg">
              XEM CHI TIẾT
            </span>
            <ArrowRight className="h-6 w-6 text-purple-600 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

        {/* Hover Border Effect */}
        <div className="absolute inset-0 rounded-3xl border-4 border-transparent group-hover:border-purple-500 transition-all duration-500"></div>
      </div>
    </Link>
  );
}

// Ultra Trainer Card Component
function UltraTrainerCard({
  name,
  specialty,
  image,
  experience,
  accentColor,
  index,
}) {
  const colors = {
    red: "from-red-500 to-pink-500",
    purple: "from-purple-500 to-indigo-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-yellow-500",
  };

  return (
    <div className="trainer-card group relative overflow-hidden rounded-3xl bg-white shadow-2xl hover:shadow-4xl transition-all duration-700 transform-gpu">
      {/* Glow Effect - Fixed positioning */}
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${colors[accentColor]} rounded-3xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-500 -z-10`}
      ></div>

      <div className="relative bg-white rounded-3xl overflow-hidden">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${colors[accentColor]} opacity-40 group-hover:opacity-20 transition-opacity duration-500`}
          />

          {/* Floating Badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-xs font-bold">
              ⭐ EXPERT
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center bg-gradient-to-br from-white to-gray-50">
          <h3 className="text-2xl font-black text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
            {name}
          </h3>
          <p className="text-purple-600 font-bold mb-2 text-lg">{specialty}</p>
          <p className="text-gray-600 font-semibold">{experience}</p>

          {/* Social Icons */}
          <div className="flex justify-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 360 }}
              className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer"
            >
              <span className="text-white text-xs font-bold">f</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 360 }}
              className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center cursor-pointer"
            >
              <span className="text-white text-xs font-bold">@</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 360 }}
              className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center cursor-pointer"
            >
              <span className="text-white text-xs font-bold">in</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ultra Testimonial Card Component
function UltraTestimonialCard({
  name,
  role,
  content,
  rating,
  image,
  cardGradient,
  accentColor,
  index,
}) {
  const glowColors = {
    pink: "shadow-pink-500/50",
    blue: "shadow-blue-500/50",
    green: "shadow-green-500/50",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${cardGradient} p-8 shadow-2xl hover:shadow-4xl ${glowColors[accentColor]} transition-all duration-700 transform hover:scale-105 hover:rotate-2`}
    >
      {/* Quote Icon */}
      <div className="absolute top-4 left-4">
        <div className="text-6xl text-gray-300 font-serif">"</div>
      </div>

      {/* Stars */}
      <div className="flex justify-center mb-6">
        {[...Array(rating)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Star className="h-8 w-8 text-yellow-400 fill-current mx-1" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-700 mb-8 italic text-xl leading-relaxed text-center font-medium">
        "{content}"
      </p>

      {/* Profile */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          <img
            src={image}
            alt={name}
            className="relative w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl"
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="ml-6 text-center">
          <h4 className="text-2xl font-black text-gray-800">{name}</h4>
          <p className="text-purple-600 font-bold text-lg">{role}</p>
        </div>
      </div>
    </div>
  );
}

// Ultra Stats Card Component
function UltraStatsCard({ number, label, gradient, icon }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:bg-white/20 transition-all duration-500 shadow-2xl">
      {/* Background Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
      ></div>

      <div className="relative z-10 text-center">
        <div className="mb-4 flex justify-center">
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>
        </div>
        <div
          className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}
        >
          {number}
        </div>
        <p className="text-white/90 text-sm font-semibold">{label}</p>
      </div>
    </div>
  );
}
