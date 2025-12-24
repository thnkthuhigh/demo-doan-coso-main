import mongoose from 'mongoose';

const serviceRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const ServiceRegistration = mongoose.model('ServiceRegistration', serviceRegistrationSchema);

export default ServiceRegistration;
