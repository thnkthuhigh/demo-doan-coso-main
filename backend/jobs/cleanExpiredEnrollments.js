import ClassEnrollment from '../models/ClassEnrollment.js';

/**
 * Tự động xóa các enrollment đã hết hạn (quá 2 ngày chưa thanh toán)
 * Chạy mỗi 1 giờ
 */
export const cleanExpiredEnrollments = async () => {
  try {
    const now = new Date();
    
    // Tìm các enrollment hết hạn và chưa thanh toán
    const expiredEnrollments = await ClassEnrollment.find({
      paymentStatus: false,
      expiresAt: { $lt: now },
      status: { $ne: 'cancelled' }
    }).populate('class', 'className').populate('user', 'username email');

    if (expiredEnrollments.length === 0) {
      console.log('✅ No expired enrollments to clean');
      return { cleaned: 0, enrollments: [] };
    }

    console.log(`\n⏰ Found ${expiredEnrollments.length} expired enrollments:`);
    
    const cleaned = [];
    for (const enrollment of expiredEnrollments) {
      const className = enrollment.class?.className || 'Unknown';
      const userName = enrollment.user?.username || enrollment.user?.email || 'Unknown';
      
      console.log(`   - ${userName} @ ${className} (expired: ${enrollment.expiresAt})`);
      
      // Xóa enrollment
      await ClassEnrollment.deleteOne({ _id: enrollment._id });
      
      cleaned.push({
        enrollmentId: enrollment._id,
        user: userName,
        class: className,
        expiredAt: enrollment.expiresAt
      });
    }

    console.log(`✅ Cleaned ${cleaned.length} expired enrollments\n`);
    
    return { cleaned: cleaned.length, enrollments: cleaned };
  } catch (error) {
    console.error('❌ Error cleaning expired enrollments:', error);
    return { cleaned: 0, error: error.message };
  }
};

// Chạy mỗi 1 giờ (3600000 ms)
export const startCleanupJob = () => {
  console.log('🔄 Started enrollment cleanup job (runs every hour)');
  
  // Chạy ngay khi start
  cleanExpiredEnrollments();
  
  // Sau đó chạy mỗi 1 giờ
  setInterval(cleanExpiredEnrollments, 60 * 60 * 1000);
};
