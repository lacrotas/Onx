const Router = require('express');
const router = new Router();
const feedController = require('../controllers/feedController');

router.get('/google-merchant.xml', (req, res) => feedController.getGoogleMerchantFeed(req, res));
router.get('/google-merchant', (req, res) => feedController.getGoogleMerchantFeed(req, res));

module.exports = router;
