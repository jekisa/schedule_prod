import mongoose from 'mongoose';

const BuyerSchema = new mongoose.Schema(
  {
    buyer_name: {
      type: String,
      required: [true, 'Buyer name is required'],
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

BuyerSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

BuyerSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

BuyerSchema.set('toObject', { virtuals: true });

export default mongoose.models.Buyer || mongoose.model('Buyer', BuyerSchema);
