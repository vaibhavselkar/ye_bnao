require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const mealPlanRouter = require('./routes/mealPlan');
const sabziRouter = require('./routes/sabzi');
const trendsRouter = require('./routes/trends');
const leftoverRouter = require('./routes/leftover');
const authRouter = require('./routes/auth');
const requireAuth = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' });
app.use('/api/', limiter);

// All /api routes require a valid Firebase token (or "guest" token)
app.use('/api/', requireAuth);

// Routes
app.use('/api/meal-plan', mealPlanRouter);
app.use('/api/sabzi', sabziRouter);
app.use('/api/trends', trendsRouter);
app.use('/api/leftover', leftoverRouter);

// Auth routes (no Firebase token required — these are for logging in)
app.use('/auth', authRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Ye Bnao API is running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Local dev: listen on port. Vercel: export the app.
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Ye Bnao API running on port ${PORT}`));
}

module.exports = app;
