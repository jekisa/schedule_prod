import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      required: [true, 'Category name is required'],
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

CategorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

CategorySchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

CategorySchema.set('toObject', { virtuals: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
