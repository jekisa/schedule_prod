import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  username: {
    type: String,
    required: true,
  },
  full_name: {
    type: String,
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE'],
    required: true,
  },
  entity_type: {
    type: String,
    required: true,
  },
  entity_id: {
    type: String,
    required: true,
  },
  entity_name: {
    type: String,
  },
  old_values: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  new_values: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

AuditLogSchema.index({ entity_type: 1, timestamp: -1 });
AuditLogSchema.index({ user_id: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
