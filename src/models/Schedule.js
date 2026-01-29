import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema(
  {
    schedule_type: {
      type: String,
      enum: ['potong', 'jahit', 'sablon', 'bordir'],
      required: [true, 'Schedule type is required'],
    },
    article_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    article_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    pic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    week_delivery: {
      type: String,
      required: true,
    },
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Virtual for id
ScheduleSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised
ScheduleSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

ScheduleSchema.set('toObject', {
  virtuals: true,
});

// Index for faster queries
ScheduleSchema.index({ schedule_type: 1, start_date: 1 });
ScheduleSchema.index({ supplier_id: 1, start_date: 1, end_date: 1 });
ScheduleSchema.index({ pic_id: 1 });

export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
