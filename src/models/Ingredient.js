import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema(
  {
    no_po_bahan: {
      type: String,
      required: [true, 'No PO Bahan harus diisi'],
      trim: true,
    },
    status_bahan: {
      type: String,
      trim: true,
    },
    plan_delivery: {
      type: String,
      trim: true,
    },
    qty_po_bahan: {
      type: Number,
      default: 0,
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
IngredientSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

IngredientSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

IngredientSchema.set('toObject', {
  virtuals: true,
});

export default mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema);
