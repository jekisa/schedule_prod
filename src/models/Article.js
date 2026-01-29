import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema(
  {
    article_name: {
      type: String,
      required: [true, 'Article name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
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
ArticleSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised
ArticleSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

ArticleSchema.set('toObject', {
  virtuals: true,
});

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
