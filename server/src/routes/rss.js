const express = require('express');
const router = express.Router();
const rssController = require('../controllers/rssController');

router.get('/', rssController.generate);

module.exports = router;
