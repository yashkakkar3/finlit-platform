const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const { startLeaderboardJob } = require('./jobs/leaderboardJob');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api', lessonRoutes);       // /api/learning-tree, /api/lessons/:id, /api/lessons/:id/submit
app.use('/api', leaderboardRoutes);  // /api/leaderboard

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`FinLit backend running on http://localhost:${PORT}`);
  startLeaderboardJob();
});

module.exports = app;
