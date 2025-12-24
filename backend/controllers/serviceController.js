import Service from "../models/Service.js";
import ServiceRegistration from "../models/ServiceRegistration.js";

// Lấy danh sách tất cả dịch vụ
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách dịch vụ." });
  }
};

// Lấy chi tiết dịch vụ theo ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Không tìm thấy dịch vụ." });
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy chi tiết dịch vụ." });
  }
};

// Thêm dịch vụ mới
export const createService = async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(400).json({ error: "Lỗi khi tạo dịch vụ." });
  }
};

// Cập nhật dịch vụ theo ID
export const updateService = async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Lỗi khi cập nhật dịch vụ." });
  }
};

// Đăng ký dịch vụ (thêm vào giỏ hàng)
export const registerService = async (req, res) => {
  try {
    const { serviceId, userId } = req.body;
    
    if (!serviceId || !userId) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin serviceId hoặc userId' 
      });
    }
    
    // Kiểm tra dịch vụ có tồn tại
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }
    
    // Kiểm tra đã đăng ký chưa
    const existingRegistration = await ServiceRegistration.findOne({
      userId,
      serviceId,
      paymentStatus: false
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'Dịch vụ này đã có trong giỏ hàng' 
      });
    }
    
    // Tạo đăng ký dịch vụ (chưa thanh toán)
    const registration = new ServiceRegistration({
      userId,
      serviceId,
      paymentStatus: false,
      status: 'pending'
    });
    
    await registration.save();
    
    res.status(201).json({
      message: 'Đã thêm dịch vụ vào giỏ hàng!',
      registration: {
        _id: registration._id,
        serviceName: service.name,
        serviceId: service._id,
        price: service.price,
      }
    });
  } catch (error) {
    console.error('Error registering service:', error);
    res.status(500).json({ 
      message: 'Lỗi khi thêm vào giỏ hàng',
      error: error.message 
    });
  }
};

// Lấy danh sách dịch vụ đã đăng ký của user
export const getUserServiceRegistrations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const registrations = await ServiceRegistration.find({ userId })
      .populate('serviceId')
      .sort({ registrationDate: -1 });
    
    // Format data cho mobile
    const formattedData = registrations.map(reg => ({
      _id: reg._id,
      name: reg.serviceId?.name || 'Dịch vụ không xác định',
      serviceName: reg.serviceId?.name || 'Dịch vụ không xác định',
      description: reg.serviceId?.description || '',
      price: reg.serviceId?.price || 0,
      image: reg.serviceId?.image || '',
      paymentStatus: reg.paymentStatus,
      status: reg.status,
      registrationDate: reg.registrationDate,
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching service registrations:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy danh sách dịch vụ',
      error: error.message 
    });
  }
};

// Xóa dịch vụ theo ID
export const deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa dịch vụ thành công." });
  } catch (err) {
    res.status(400).json({ error: "Lỗi khi xóa dịch vụ." });
  }
};
