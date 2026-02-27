import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema(
  {
    brand_name: {
      type: String,
      required: [true, 'Brand name is required'],
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

BrandSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

BrandSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

BrandSchema.set('toObject', { virtuals: true });

export default mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
