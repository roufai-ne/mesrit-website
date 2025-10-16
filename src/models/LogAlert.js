import mongoose from 'mongoose';

const logAlertSchema = new mongoose.Schema({
  // Reference to the log that triggered this alert
  logId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SystemLog',
    required: true
  },
  
  // Alert details
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Alert level (same as log level)
  level: {
    type: String,
    enum: ['error', 'warning', 'info', 'success', 'debug'],
    required: true
  },
  
  // Alert category
  category: {
    type: String,
    enum: ['auth', 'user', 'content', 'system', 'security', 'performance', 'api'],
    required: true
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Notification status
  status: {
    type: String,
    enum: ['pending', 'sent', 'acknowledged', 'resolved'],
    default: 'pending'
  },
  
  // Notification recipients
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Notification channels
  channels: [{
    type: String,
    enum: ['email', 'sms', 'push', 'dashboard']
  }],
  
  // Alert rules that triggered this alert
  triggeredBy: {
    type: String,
    required: true
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
logAlertSchema.index({ logId: 1 });
logAlertSchema.index({ level: 1, status: 1 });
logAlertSchema.index({ category: 1 });
logAlertSchema.index({ priority: 1 });
logAlertSchema.index({ status: 1 });
logAlertSchema.index({ createdAt: -1 });

export default mongoose.models.LogAlert || mongoose.model('LogAlert', logAlertSchema);