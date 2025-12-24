import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import BankPopup from "./BankPopup";
import ConfirmationModal from "./ConfirmationModal";
import { motion } from "framer-motion";
import {
  CreditCard,
  Shield,
  CheckCircle,
  X,
  Clock,
  Star,
  Gift,
  Trash2,
  Copy,
  Sparkles,
  Crown,
  Receipt,
  ArrowRight,
  Zap,
  Heart,
  Award,
  Leaf,
  Mountain,
  Waves,
} from "lucide-react";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("cart"); // "cart" or "pending"
  const [pendingPayments, setPendingPayments] = useState([]);
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
  const [registeredClasses, setRegisteredClasses] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showBankPopup, setShowBankPopup] = useState(false);
  const [membershipPayment, setMembershipPayment] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState({});
  const [includeMembership, setIncludeMembership] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  // Add custom styling cho navbar khi vào trang Payment
  useEffect(() => {
    document.body.classList.add("payment-page");
    return () => {
      document.body.classList.remove("payment-page");
    };
  }, []);

  // Decode token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const payload = jwtDecode(token);
      setUserId(payload.userId);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Check if we have a pending membership payment
  useEffect(() => {
    const pendingMembershipString = localStorage.getItem("pendingMembership");
    if (pendingMembershipString) {
      try {
        const pendingMembership = JSON.parse(pendingMembershipString);
        setMembershipPayment(pendingMembership);
      } catch (error) {
        console.error("Error parsing pending membership:", error);
      }
    } else {
      if (location.state?.fromMembership && location.state?.membershipId) {
        const fetchMembershipDetails = async () => {
          try {
            const token = localStorage.getItem("token");
            if (!token || !userId) return;

            const response = await fetch(
              `http://localhost:5000/api/memberships/${location.state.membershipId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const membershipData = await response.json();
              setMembershipPayment({
                id: membershipData._id,
                type: membershipData.type,
                price: membershipData.price,
                duration: membershipData.endDate
                  ? Math.round(
                      (new Date(membershipData.endDate) -
                        new Date(membershipData.startDate)) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 30,
              });
            }
          } catch (error) {
            console.error("Error fetching membership details:", error);
          }
        };

        fetchMembershipDetails();
      }
    }
  }, [location, userId]);

  // Fetch user info + unpaid class enrollments
  const fetchUnpaidRegistrations = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const [userRes, enrollmentRes, paymentsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/classes/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/payments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const userInfo = await userRes.json();
      const enrollments = await enrollmentRes.json();
      
      // Handle payments response - might be error object
      let payments = [];
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        payments = Array.isArray(paymentsData) ? paymentsData : [];
      } else {
        console.warn("Failed to fetch payments, using empty array");
      }

      if (!userRes.ok) throw new Error("User API error");
      if (!enrollmentRes.ok) throw new Error("Enrollments API error");

      console.log("=== PAYMENT PAGE DEBUG ===");
      console.log("Total enrollments fetched:", enrollments.length);
      console.log("All enrollments:", enrollments);
      console.log("Enrollments without payment:", enrollments.filter(e => !e.paymentStatus));

      setUserData({
        name: userInfo.username,
        email: userInfo.email,
        phone: userInfo.phone || "",
      });

      // Lấy danh sách enrollment IDs đang có payment pending
      const pendingClassPayments = payments.filter(
        payment => payment.status === "pending" && payment.paymentType === "class"
      );
      
      const pendingEnrollmentIds = pendingClassPayments
        .flatMap(payment => payment.registrationIds || [])
        .map(id => id.toString());

      console.log("Pending enrollment IDs:", pendingEnrollmentIds);
      console.log("Pending payments:", pendingClassPayments);
      
      // Lưu pending payments để hiển thị trong tab "Chờ xác nhận"
      setPendingPayments(pendingClassPayments);

      // Chỉ hiển thị enrollments chưa thanh toán VÀ không có payment pending
      const unpaidEnrollments = enrollments.filter(
        (enrollment) => {
          const hasClass = !!enrollment.class;
          const notPaid = !enrollment.paymentStatus;
          const notPending = !pendingEnrollmentIds.includes(enrollment._id.toString());
          
          console.log(`Enrollment ${enrollment._id}:`, {
            className: enrollment.class?.className,
            hasClass,
            notPaid,
            notPending,
            willShow: hasClass && notPaid && notPending
          });
          
          return notPaid && hasClass && notPending;
        }
      );

      console.log("Unpaid enrollments to show:", unpaidEnrollments.length);
      console.log("=== END DEBUG ===");

      setRegisteredClasses(
        unpaidEnrollments.map((enrollment) => ({
          id: enrollment._id,
          classId: enrollment.class?._id || enrollment.classId,
          name: enrollment.class?.className || enrollment.name,
          price: enrollment.class?.price || enrollment.price,
          serviceName: enrollment.class?.serviceName || enrollment.serviceName,
          instructorName: enrollment.class?.instructorName || enrollment.instructorName,
          schedule: enrollment.class?.schedule || enrollment.schedule,
        }))
      );
    } catch (e) {
      console.error("Load error:", e);
      setRegisteredClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaidRegistrations();
  }, [userId]);

  // Auto-select class if coming from Classes page with pending payment
  useEffect(() => {
    if (location.state?.autoSelectClass && registeredClasses.length > 0) {
      const classToSelect = location.state.autoSelectClass;
      setSelectedClasses({ [classToSelect]: true });
      // Clear the state to prevent re-selection on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, registeredClasses]);

  // Hàm xóa đăng ký lớp học
  const handleDeleteRegistration = async (enrollmentId) => {
    setDeletingClassId(enrollmentId);
    setDeleteError("");
    setShowDeleteConfirm(true);
  };

  // Add new function for actual deletion
  const confirmDeleteRegistration = async () => {
    if (!deletingClassId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setDeleteError("Bạn cần đăng nhập lại!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/payments/enrollment/${deletingClassId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Không thể xóa đăng ký");
      }

      // Success - remove from list
      setRegisteredClasses(
        registeredClasses.filter((cls) => cls.id !== deletingClassId)
      );

      const newSelectedClasses = { ...selectedClasses };
      delete newSelectedClasses[deletingClassId];
      setSelectedClasses(newSelectedClasses);

      // Đóng modal
      setShowDeleteConfirm(false);
      setDeletingClassId(null);
      setDeleteError("");

      // Thông báo thành công (có thể thêm toast)
      console.log("Đã xóa đăng ký lớp học thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa đăng ký:", error);
      setDeleteError(error.message);
    }
  };

  // Add function to close modal
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingClassId(null);
    setDeleteError("");
  };

  // Animation variants với tinh thần Zen
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.08,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.25, 0, 1],
      },
    },
  };

  // Initialize selected classes
  useEffect(() => {
    if (registeredClasses.length > 0) {
      const initialSelectedState = {};
      registeredClasses.forEach((cls) => {
        initialSelectedState[cls.id] = true;
      });
      setSelectedClasses(initialSelectedState);
    }
  }, [registeredClasses]);

  // Toggle class selection
  const toggleClassSelection = (classId) => {
    const newState = {
      ...selectedClasses,
      [classId]: !selectedClasses[classId],
    };
    setSelectedClasses(newState);
  };

  // Calculate total
  const calculateTotal = (selectedState) => {
    let sum = 0;
    Object.keys(selectedState).forEach((clsId) => {
      if (selectedState[clsId]) {
        const cls = registeredClasses.find((c) => c.id === clsId);
        if (cls) {
          sum += cls.price;
        }
      }
    });

    if (membershipPayment && includeMembership) {
      sum += membershipPayment.price;
    }

    return sum;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100">
        {/* Zen Loading Animation */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-slate-300 border-t-slate-700 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-8 h-8 m-auto border-2 border-gray-400 border-b-gray-800 rounded-full"
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-slate-700 text-lg font-light tracking-wide"
        >
          Đang tải...
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-slate-500 text-sm"
        >
          Vui lòng đợi trong giây lát
        </motion.p>
      </div>
    );
  }

  const total = calculateTotal(selectedClasses);

  // Handle payment
  const handlePayment = () => {
    if (!selectedMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    if (selectedMethod === "Thẻ ngân hàng") {
      setShowBankPopup(true);
    } else {
      handleDirectPayment();
    }
  };

  // Handle direct payment
  const handleDirectPayment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn cần đăng nhập lại!");
        navigate("/login");
        return;
      }

      const selectedClassIds = registeredClasses
        .filter((cls) => selectedClasses[cls.id])
        .map((cls) => cls.id);

      if (
        selectedClassIds.length === 0 &&
        (!membershipPayment || !includeMembership)
      ) {
        alert("Vui lòng chọn ít nhất một dịch vụ để thanh toán");
        return;
      }

      const registrationIds = [...selectedClassIds];
      if (membershipPayment && includeMembership) {
        registrationIds.push(membershipPayment.id);
      }

      let paymentType = "class";
      if (
        membershipPayment &&
        includeMembership &&
        selectedClassIds.length > 0
      ) {
        paymentType = "membership_and_class";
      } else if (membershipPayment && includeMembership) {
        paymentType = membershipPayment.isUpgrade
          ? "membership_upgrade"
          : "membership";
      }

      const response = await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: total,
          method: selectedMethod,
          registrationIds: registrationIds,
          status: "pending",
          paymentType: paymentType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Thanh toán lỗi");
      }

      if (membershipPayment && includeMembership) {
        localStorage.removeItem("pendingMembership");
        localStorage.removeItem("pendingPayment");
      }

      setShowReceipt(true);
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      alert("Không thể thanh toán. Vui lòng thử lại sau: " + error.message);
    }
  };

  // Payment methods với thiết kế Zen
  const paymentMethods = [
    {
      id: "Thẻ ngân hàng",
      name: "Chuyển khoản ngân hàng",
      icon: <CreditCard className="w-5 h-5" />,
      description: "Giao dịch an toàn qua ngân hàng",
      color: "from-slate-600 to-slate-700",
      bgLight: "bg-slate-50",
      recommended: true,
    },
    {
      id: "VNPay",
      name: "VNPay",
      icon: <Zap className="w-5 h-5" />,
      description: "Ví điện tử VNPay",
      color: "from-blue-600 to-indigo-700",
      bgLight: "bg-blue-50",
    },
    {
      id: "Momo",
      name: "Momo",
      icon: <Heart className="w-5 h-5" />,
      description: "Ví điện tử Momo",
      color: "from-pink-600 to-rose-700",
      bgLight: "bg-pink-50",
    },
    {
      id: "ZaloPay",
      name: "ZaloPay",
      icon: <Award className="w-5 h-5" />,
      description: "Ví điện tử ZaloPay",
      color: "from-emerald-600 to-teal-700",
      bgLight: "bg-emerald-50",
    },
  ];

  return (
    <>
      {/* Zen CSS Styles */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        .zen-text-primary {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        .zen-text-heading {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .zen-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.04);
        }

        .zen-card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .zen-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
        }

        .zen-button {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: "Inter", sans-serif;
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        .zen-divider {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(148, 163, 184, 0.3),
            transparent
          );
          height: 1px;
        }

        .zen-bg {
          background: linear-gradient(
            135deg,
            #f8fafc 0%,
            #f1f5f9 25%,
            #e2e8f0 50%,
            #f1f5f9 75%,
            #f8fafc 100%
          );
        }
      `}</style>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen zen-bg pt-16 pb-20"
      >
        {/* Floating Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div
            animate={{
              y: [0, -30, 0],
              rotate: [0, 5, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-20"
          >
            <Leaf className="h-32 w-32 text-slate-300" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 40, 0],
              x: [0, -20, 0],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5,
            }}
            className="absolute top-40 right-32"
          >
            <Mountain className="h-40 w-40 text-slate-200" />
          </motion.div>

          <motion.div
            animate={{
              x: [0, 30, 0],
              opacity: [0.08, 0.18, 0.08],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 10,
            }}
            className="absolute bottom-32 left-1/3"
          >
            <Waves className="h-28 w-28 text-blue-200" />
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="zen-card rounded-2xl p-12 max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 rounded-xl shadow-sm">
                  <Receipt className="h-7 w-7 text-white" />
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl zen-text-heading text-slate-800 mb-4">
                Thanh Toán
              </h1>
              <h2 className="text-2xl zen-text-primary text-slate-600 mb-6">
                Hoàn tất đơn hàng của bạn
              </h2>
              <div className="zen-divider w-24 mx-auto mb-6"></div>
              <p className="text-lg zen-text-primary text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Hoàn tất thanh toán để bắt đầu hành trình fitness với sự tập
                trung và tĩnh lặng
              </p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Order Details - 3 columns */}
            <motion.div variants={itemVariants} className="xl:col-span-3">
              <div className="zen-card rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8">
                  <div className="flex items-center">
                    <div className="bg-white/15 p-3 rounded-xl mr-4">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl zen-text-heading text-white mb-1">
                        Chi Tiết Đơn Hàng
                      </h2>
                      <p className="text-slate-200 zen-text-primary">
                        Xem lại và chỉnh sửa đơn hàng
                      </p>
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setActiveTab("cart")}
                      className={`flex-1 px-4 py-3 rounded-xl zen-button transition-all ${
                        activeTab === "cart"
                          ? "bg-white text-slate-800"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Receipt className="h-5 w-5 mr-2" />
                        <span>Giỏ Hàng</span>
                        {registeredClasses.length > 0 && (
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            activeTab === "cart" ? "bg-slate-800 text-white" : "bg-white/20"
                          }`}>
                            {registeredClasses.length}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("pending")}
                      className={`flex-1 px-4 py-3 rounded-xl zen-button transition-all ${
                        activeTab === "pending"
                          ? "bg-white text-slate-800"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Clock className="h-5 w-5 mr-2" />
                        <span>Chờ Xác Nhận</span>
                        {pendingPayments.length > 0 && (
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            activeTab === "pending" ? "bg-slate-800 text-white" : "bg-white/20"
                          }`}>
                            {pendingPayments.length}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {activeTab === "cart" ? (
                    // Giỏ hàng - existing content
                    <>
                  {registeredClasses.length === 0 && !membershipPayment ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-20"
                    >
                      <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Gift className="h-10 w-10 text-slate-400" />
                      </div>
                      <h3 className="text-xl zen-text-heading text-slate-700 mb-4">
                        Giỏ Hàng Trống
                      </h3>
                      <p className="zen-text-primary text-slate-500 mb-8">
                        Chưa có mục nào cần thanh toán
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate("/classes")}
                          className="zen-button px-8 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
                        >
                          Khám phá lớp học
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate("/membership")}
                          className="zen-button px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
                        >
                          Xem gói tập
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-8">
                      {/* Classes Section */}
                      {registeredClasses.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                              <div className="bg-slate-100 p-2 rounded-lg mr-3">
                                <Star className="h-5 w-5 text-slate-600" />
                              </div>
                              <h3 className="text-lg zen-text-heading text-slate-800">
                                Đăng Ký Lớp Học ({registeredClasses.length})
                              </h3>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const newSelectedState = {};
                                const allSelected = registeredClasses.every(
                                  (cls) => selectedClasses[cls.id]
                                );
                                registeredClasses.forEach((cls) => {
                                  newSelectedState[cls.id] = !allSelected;
                                });
                                setSelectedClasses(newSelectedState);
                              }}
                              className="zen-button text-sm px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
                            >
                              {registeredClasses.every(
                                (cls) => selectedClasses[cls.id]
                              )
                                ? "Bỏ chọn tất cả"
                                : "Chọn tất cả"}
                            </motion.button>
                          </div>

                          <div className="space-y-4">
                            {registeredClasses.map((cls, index) => (
                              <motion.div
                                key={cls.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`zen-card-hover p-6 rounded-xl border-2 transition-all duration-300 ${
                                  selectedClasses[cls.id]
                                    ? "border-slate-300 bg-slate-50/50"
                                    : "border-slate-200 bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 flex-grow">
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        id={`class-${cls.id}`}
                                        checked={
                                          selectedClasses[cls.id] || false
                                        }
                                        onChange={() =>
                                          toggleClassSelection(cls.id)
                                        }
                                        className="w-5 h-5 text-slate-600 border-2 border-slate-300 rounded focus:ring-slate-400 focus:ring-2"
                                      />
                                      {selectedClasses[cls.id] && (
                                        <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-slate-600" />
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <label
                                        htmlFor={`class-${cls.id}`}
                                        className="zen-text-heading text-lg text-slate-800 cursor-pointer block mb-1"
                                      >
                                        {cls.name}
                                      </label>
                                      <p className="zen-text-primary text-slate-600 mb-1">
                                        <span className="font-medium">
                                          {cls.serviceName}
                                        </span>
                                        {cls.instructorName && (
                                          <> • HLV: {cls.instructorName}</>
                                        )}
                                      </p>
                                      <p className="text-sm text-slate-400">
                                        ID: {cls.id.slice(-8).toUpperCase()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                      <p className="text-2xl zen-text-heading text-slate-800">
                                        {cls.price.toLocaleString()}₫
                                      </p>
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        handleDeleteRegistration(cls.id)
                                      }
                                      className="zen-button bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg transition-all duration-200"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Membership Section */}
                      {membershipPayment && (
                        <div>
                          <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-2 rounded-lg mr-3">
                              <Crown className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-lg zen-text-heading text-slate-800">
                              Gói Thành Viên
                            </h3>
                          </div>

                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="zen-card border-2 border-slate-300 rounded-xl p-6"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <input
                                  type="checkbox"
                                  id="membership-checkbox"
                                  checked={includeMembership}
                                  onChange={() =>
                                    setIncludeMembership(!includeMembership)
                                  }
                                  className="w-5 h-5 text-slate-600 border-2 border-slate-300 rounded focus:ring-slate-400 focus:ring-2"
                                />
                                <div>
                                  <label
                                    htmlFor="membership-checkbox"
                                    className="zen-text-heading text-xl text-slate-800 cursor-pointer block mb-1"
                                  >
                                    {membershipPayment.name ||
                                      `Gói ${membershipPayment.type}`}
                                  </label>
                                  <p className="zen-text-primary text-slate-600 mb-1">
                                    Thời hạn:{" "}
                                    {membershipPayment.duration === 30
                                      ? "1 tháng"
                                      : membershipPayment.duration === 90
                                      ? "3 tháng"
                                      : membershipPayment.duration === 180
                                      ? "6 tháng"
                                      : membershipPayment.duration === 365
                                      ? "12 tháng"
                                      : `${membershipPayment.duration} ngày`}
                                  </p>
                                  <p className="text-sm text-slate-400">
                                    ID:{" "}
                                    {membershipPayment.id
                                      .substring(
                                        membershipPayment.id.length - 8
                                      )
                                      .toUpperCase()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-3xl zen-text-heading text-slate-800">
                                  {new Intl.NumberFormat("vi-VN").format(
                                    membershipPayment.price
                                  )}
                                  ₫
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {/* Total Section */}
                      <div className="zen-card border border-slate-200 rounded-xl p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-lg">
                            <span className="zen-text-primary text-slate-600">
                              Tạm tính
                            </span>
                            <span className="zen-text-heading text-slate-800">
                              {total.toLocaleString()}₫
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-lg">
                            <span className="zen-text-primary text-slate-600">
                              Phí dịch vụ
                            </span>
                            <span className="zen-text-heading text-emerald-600">
                              Miễn phí
                            </span>
                          </div>
                          <div className="zen-divider"></div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-xl zen-text-heading text-slate-800">
                              Tổng cộng
                            </span>
                            <span className="text-3xl zen-text-heading text-slate-900">
                              {total.toLocaleString()}₫
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                    </>
                  ) : (
                    // Tab Chờ Xác Nhận
                    <div>
                      {pendingPayments.length === 0 ? (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-center py-20"
                        >
                          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Clock className="h-10 w-10 text-slate-400" />
                          </div>
                          <h3 className="text-xl zen-text-heading text-slate-700 mb-4">
                            Không Có Thanh Toán Chờ Xác Nhận
                          </h3>
                          <p className="zen-text-primary text-slate-500">
                            Các khoản thanh toán của bạn sẽ hiển thị ở đây khi đang chờ xác nhận từ admin
                          </p>
                        </motion.div>
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                            <div className="flex items-start">
                              <Clock className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
                              <div>
                                <h3 className="zen-text-heading text-yellow-800 mb-2">
                                  Đang Chờ Xác Nhận
                                </h3>
                                <p className="zen-text-primary text-yellow-700 text-sm">
                                  Thanh toán của bạn đang được xử lý. Admin sẽ xác nhận trong thời gian sớm nhất.
                                </p>
                              </div>
                            </div>
                          </div>

                          {pendingPayments.map((payment) => (
                            <motion.div
                              key={payment._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="zen-card border border-slate-200 rounded-xl p-6"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <div className="flex items-center mb-2">
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm zen-text-heading mr-3">
                                      Chờ Xác Nhận
                                    </span>
                                    <span className="text-sm text-slate-500">
                                      {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-600 zen-text-primary">
                                    Mã thanh toán: <span className="font-mono">{payment._id.substring(payment._id.length - 8).toUpperCase()}</span>
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl zen-text-heading text-slate-900">
                                    {new Intl.NumberFormat('vi-VN').format(payment.amount)}₫
                                  </p>
                                  <p className="text-sm text-slate-500 mt-1">
                                    {payment.method}
                                  </p>
                                </div>
                              </div>

                              <div className="zen-divider my-4"></div>

                              <div className="space-y-3">
                                <p className="text-sm zen-text-heading text-slate-700 mb-2">
                                  Lớp học đã đăng ký:
                                </p>
                                {payment.registrationIds && payment.registrationIds.map((regId, idx) => {
                                  // Find class info from enrollments
                                  const classInfo = registeredClasses.find(c => c.id === regId) || 
                                                  { name: 'Lớp học', serviceName: 'Dịch vụ', price: 0 };
                                  return (
                                    <div key={idx} className="flex justify-between items-center bg-slate-50 rounded-lg p-3">
                                      <div>
                                        <p className="zen-text-heading text-slate-800">{classInfo.name}</p>
                                        <p className="text-sm text-slate-500">{classInfo.serviceName}</p>
                                      </div>
                                      <p className="zen-text-heading text-slate-700">
                                        {new Intl.NumberFormat('vi-VN').format(classInfo.price)}₫
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Payment Methods - 2 columns - Only show in cart tab */}
            {activeTab === "cart" && (
            <motion.div variants={itemVariants} className="xl:col-span-2">
              <div className="zen-card rounded-2xl overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6">
                  <div className="flex items-center">
                    <div className="bg-white/15 p-2 rounded-lg mr-3">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg zen-text-heading text-white mb-1">
                        Phương Thức Thanh Toán
                      </h2>
                      <p className="text-slate-200 text-sm zen-text-primary">
                        Chọn cách thức phù hợp
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {paymentMethods.map((method, index) => (
                      <motion.label
                        key={method.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`zen-card-hover relative block cursor-pointer transition-all duration-200 ${
                          selectedMethod === method.id
                            ? "ring-2 ring-slate-400 shadow-lg"
                            : ""
                        }`}
                      >
                        <div
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedMethod === method.id
                              ? "border-slate-400 bg-slate-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <input
                              type="radio"
                              value={method.id}
                              checked={selectedMethod === method.id}
                              onChange={() => setSelectedMethod(method.id)}
                              className="w-4 h-4 text-slate-600 border-2 border-slate-300 focus:ring-slate-400"
                            />
                            <div
                              className={`p-2 rounded-lg bg-gradient-to-r ${method.color}`}
                            >
                              <div className="text-white">{method.icon}</div>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <span className="zen-text-heading text-slate-800">
                                  {method.name}
                                </span>
                                {method.recommended && (
                                  <span className="ml-2 bg-slate-700 text-white text-xs px-2 py-1 rounded-full">
                                    Khuyến nghị
                                  </span>
                                )}
                              </div>
                              <p className="text-sm zen-text-primary text-slate-500 mt-1">
                                {method.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.label>
                    ))}
                  </div>

                  {/* Payment Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handlePayment}
                    disabled={
                      (registeredClasses.length === 0 && !membershipPayment) ||
                      !selectedMethod ||
                      total === 0
                    }
                    className={`zen-button w-full mt-8 py-4 px-6 rounded-xl text-lg shadow-lg transition-all duration-300 ${
                      (registeredClasses.length === 0 && !membershipPayment) ||
                      !selectedMethod ||
                      total === 0
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-slate-800 hover:bg-slate-700 text-white shadow-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <Shield className="h-5 w-5" />
                      <span>
                        {total > 0 ? (
                          <>
                            Thanh toán{" "}
                            <span className="font-bold">
                              {total.toLocaleString()}₫
                            </span>
                          </>
                        ) : (
                          "Thanh toán"
                        )}
                      </span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </motion.button>

                  {/* Security Info */}
                  <div className="mt-6 text-center">
                    <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                      <Shield className="h-4 w-4" />
                      <span className="zen-text-primary">
                        Bảo mật SSL 256-bit
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            )}
          </div>
        </div>

        {/* Bank Payment Popup */}
        {showBankPopup && (
          <BankPopup
            show={showBankPopup}
            onClose={(success) => {
              setShowBankPopup(false);
              if (success) {
                setShowReceipt(true);
              }
            }}
            amount={total}
            userData={userData}
            registeredClasses={registeredClasses}
            selectedClasses={selectedClasses}
            membershipPayment={membershipPayment}
            includeMembership={includeMembership}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={closeDeleteConfirm}
          onConfirm={
            deleteError ? closeDeleteConfirm : confirmDeleteRegistration
          }
          title={deleteError ? "Lỗi xóa đăng ký" : "Xác nhận xóa đăng ký"}
          message={
            deleteError
              ? deleteError
              : "Bạn có chắc chắn muốn xóa đăng ký lớp học này? Hành động này không thể hoàn tác."
          }
          confirmText={deleteError ? "Đóng" : "Xóa đăng ký"}
          cancelText="Hủy"
          isError={!!deleteError}
        />
      </motion.div>
    </>
  );
}
