const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Overall', 'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other'],
    required: true
  },
  limit: {
    type: Number,
    required: true,
    min: [0, 'Budget limit must be a positive number']
  },
  month: {
    type: Number, // 1-12 representing January-December
    required: true,
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  year: {
    type: Number,
    required: true,
    min: [2000, 'Year must be valid']
  }
}, { timestamps: true });

// Enforce single budget per category/month/year for each user
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
