// Curated Collections Routes
const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', listController.getPublicLists);
router.get('/:id', listController.getListById);
router.post('/', authMiddleware, listController.createList);
router.delete('/:id', authMiddleware, listController.deleteList);

module.exports = router;
