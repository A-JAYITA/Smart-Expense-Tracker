const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  source: {
    type: String,
    required: [true, 'Please specify an income source'],
    enum: {
      values: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'],
      message: '{VALUE} is not a supported income source'
    }
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Income', incomeSchema);
