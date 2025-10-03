const regression = require('regression');
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// CREATE expense
router.post('/', async (req, res) => {
  const { title, amount, category, date, mood} = req.body;

  try {
    const expense = new Expense({
      title,
      amount,
      category,
      date: date || new Date(),
      mood: mood || '🙂',
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// READ all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE expense by ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Expense not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});


// DELETE expense by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// --------------------
// 📌 Simple Average Predictor
// --------------------
router.get('/predict/average', async (req, res) => {
  try {
    const expenses = await Expense.find();
    const categories = {};

    expenses.forEach(e => {
      const month = new Date(e.date).getMonth();
      categories[e.category] = categories[e.category] || {};
      categories[e.category][month] =
        (categories[e.category][month] || 0) + e.amount;
    });

    const predictions = {};
    for (const cat in categories) {
      const monthlyValues = Object.values(categories[cat]);
      const lastThree = monthlyValues.slice(-3);
      const avg =
        lastThree.reduce((a, b) => a + b, 0) / lastThree.length || 0;
      predictions[cat] = Math.round(avg);
    }

    res.json(predictions); // returns { "Food": 200, "Travel": 120, ... }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// 📌 Regression Predictor
// --------------------
router.get('/predict/regression', async (req, res) => {
  console.log("📡 /predict/regression route triggered");
  try {
    const expenses = await Expense.find().sort({ date: 1 });

   const data = expenses.map(e => {
  const daysSinceStart = Math.floor(
    (new Date(e.date) - new Date(expenses[0].date)) / (1000 * 60 * 60 * 24)
  );
  return [daysSinceStart, e.amount];
});

    console.log("Regression input data:", data);

    if (data.length < 2) {
      return res.json([]); // empty array for chart safety
    }

    const result = regression.linear(data);

    const predictions = [];
    for (let i = data.length; i < data.length + 7; i++) {
      const [x, y] = result.predict(i);
      predictions.push({
        day: i - data.length + 1,
        predicted: Math.max(0, y),
      });
    }

    res.json(predictions); // returns [ {day:1, predicted:500}, ... ]
    console.log("Regression output:", predictions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

module.exports = router;