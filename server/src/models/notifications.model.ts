import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'error', 'success']
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 