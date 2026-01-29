import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema(
  {
    supplier_name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    supplier_type: {
      type: String,
      enum: ['potong', 'jahit', 'sablon', 'bordir'],
      required: [true, 'Supplier type is required'],
    },
    contact_person: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
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

// Virtual for id
SupplierSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised
SupplierSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

SupplierSchema.set('toObject', {
  virtuals: true,
});

export default mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
