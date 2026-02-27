import mongoose from 'mongoose';

const WindowSchema = new mongoose.Schema(
  {
    window_name: {
      type: String,
      required: [true, 'Window name is required'],
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

WindowSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

WindowSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

WindowSchema.set('toObject', { virtuals: true });

export default mongoose.models.Window || mongoose.model('Window', WindowSchema);
