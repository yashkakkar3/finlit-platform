const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getLearningTree, getLesson, submitQuiz } = require('../controllers/lessonController');

router.use(requireAuth);

router.get('/learning-tree', getLearningTree);
router.get('/lessons/:lessonId', getLesson);
router.post('/lessons/:lessonId/submit', submitQuiz);

module.exports = router;
