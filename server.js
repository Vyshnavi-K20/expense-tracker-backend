const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
console.log("🚀 Starting server...");
// middleware
app.use(cors());
app.use(express.json());

// routes
const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api/expenses',require('./routes/expenseRoutes'));

// connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err =>console.error(err));
