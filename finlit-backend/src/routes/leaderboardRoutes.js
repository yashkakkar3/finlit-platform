const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getWeeklyLeaderboard } = require('../controllers/leaderboardController');

router.get('/leaderboard', requireAuth, getWeeklyLeaderboard);

module.exports = router;
