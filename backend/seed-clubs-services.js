import mongoose from 'mongoose';
import Club from './models/Club.js';
import Service from './models/Service.js';
import dotenv from 'dotenv';

dotenv.config();

const clubs = [
  {
    name: 'Yoga Morning Club',
    address: 'Phòng A1, Tầng 2',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    description: 'Câu lạc bộ Yoga buổi sáng dành cho những ai muốn bắt đầu ngày mới tràn đầy năng lượng. Tập luyện với các bài yoga cơ bản đến nâng cao, giúp thư giãn tinh thần và cải thiện sức khỏe. Lịch tập: Thứ 2, 4, 6 - 6:00-7:30 AM',
  },
  {
    name: 'Boxing Fight Club',
    address: 'Phòng Combat, Tầng 3',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
    description: 'Câu lạc bộ Boxing chuyên nghiệp với đầy đủ trang thiết bị hiện đại. Học các kỹ thuật đấm bốc từ cơ bản, phát triển sức mạnh, tốc độ và sự tự tin. Lịch tập: Thứ 3, 5, 7 - 18:00-20:00',
  },
  {
    name: 'Cardio Dance Club',
    address: 'Studio Dance, Tầng 2',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    description: 'Kết hợp giữa nhảy múa và cardio, đốt cháy calo một cách vui vẻ. Phù hợp cho mọi lứa tuổi, không cần kinh nghiệm nhảy. Lịch tập: Thứ 2, 4, 6 - 19:00-20:00',
  },
  {
    name: 'Weight Training Elite',
    address: 'Khu vực tạ, Tầng 1',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    description: 'Câu lạc bộ tập tạ chuyên sâu cho người muốn tăng cơ và phát triển sức mạnh. Có HLV cá nhân hướng dẫn kỹ thuật chuẩn và lập kế hoạch riêng. Lịch tập: Thứ 2-6 - 17:00-21:00',
  },
  {
    name: 'Zumba Fitness Club',
    address: 'Studio Dance, Tầng 2',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    description: 'Câu lạc bộ Zumba sôi động với âm nhạc Latin sôi động. Giảm cân hiệu quả trong không khí vui vẻ, năng động. Lịch tập: Thứ 3, 5, 7 - 18:30-19:30',
  }
];

const services = [
  {
    name: 'Personal Training 1-1',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    description: 'Huấn luyện cá nhân 1 kèm 1 với PT chuyên nghiệp. Lập kế hoạch tập luyện và dinh dưỡng riêng biệt phù hợp với mục tiêu của bạn (giảm cân, tăng cơ, thể hình). Giá: 300,000 VNĐ/buổi (60 phút)',
  },
  {
    name: 'Massage & Spa Therapy',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    description: 'Dịch vụ massage thư giãn toàn thân sau tập, giúp giảm căng thẳng cơ bắp, thúc đẩy quá trình phục hồi. Sử dụng tinh dầu thiên nhiên cao cấp. Giá: 250,000 VNĐ/45 phút',
  },
  {
    name: 'Nutrition Consultation',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
    description: 'Tư vấn dinh dưỡng chuyên sâu với chuyên gia. Xây dựng thực đơn ăn uống khoa học, phù hợp với mục tiêu tập luyện và tình trạng sức khỏe. Bao gồm: Đo thành phần cơ thể, lập kế hoạch ăn uống 4 tuần. Giá: 500,000 VNĐ/tháng',
  },
  {
    name: 'Group Training Class',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    description: 'Lớp tập nhóm 5-10 người với nhiều môn khác nhau: HIIT, Circuit Training, Functional Training. Tạo động lực cao, chi phí hợp lý. Giá: 100,000 VNĐ/buổi hoặc 800,000 VNĐ/tháng (không giới hạn)',
  },
  {
    name: 'Body Composition Analysis',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    description: 'Phân tích thành phần cơ thể bằng máy InBody chuyên dụng. Đo chính xác tỷ lệ mỡ, cơ, nước, BMI, trao đổi chất cơ bản. Bao gồm: Báo cáo chi tiết + tư vấn kết quả. Giá: 150,000 VNĐ/lần',
  },
  {
    name: 'Swimming Pool Access',
    image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800',
    description: 'Quyền sử dụng hồ bơi tiêu chuẩn Olympic, nước luôn sạch sẽ, nhiệt độ ổn định. Phù hợp cho người muốn tập cardio nhẹ nhàng cho khớp. Giờ mở cửa: 6:00-21:00 hàng ngày. Giá: 100,000 VNĐ/lần hoặc 600,000 VNĐ/tháng',
  },
  {
    name: 'Sauna & Steam Room',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    description: 'Phòng xông hơi khô (Sauna) và ướt (Steam) cao cấp. Giúp thải độc tố, thư giãn cơ bắp, cải thiện tuần hoàn máu sau tập. Giá: 80,000 VNĐ/lần hoặc bao gồm trong gói VIP',
  },
  {
    name: 'Online Training Program',
    image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800',
    description: 'Chương trình tập luyện online với video hướng dẫn chi tiết, phù hợp cho người bận rộn. Có HLV theo dõi tiến độ qua app. Bao gồm: 12 tuần tập luyện + dinh dưỡng + hỗ trợ 24/7. Giá: 1,000,000 VNĐ/3 tháng',
  }
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await Club.deleteMany({});
    await Service.deleteMany({});
    console.log('🗑️  Cleared existing clubs and services\n');

    // Insert clubs
    const createdClubs = await Club.insertMany(clubs);
    console.log(`✅ Added ${createdClubs.length} clubs:`);
    createdClubs.forEach(club => {
      console.log(`   - ${club.name}`);
    });

    // Insert services
    const createdServices = await Service.insertMany(services);
    console.log(`\n✅ Added ${createdServices.length} services:`);
    createdServices.forEach(service => {
      console.log(`   - ${service.name}`);
    });

    console.log('\n🎉 Seed data completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

seedData();
