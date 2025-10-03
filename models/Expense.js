const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  mood: { type: String, default: "🙂" }, // NEW FIELD
  date: {
    type: Date,
    default: Date.now, // 👈 fallback if not provided
  },
});


module.exports = mongoose.model('Expense', expenseSchema);