const Router = require('express');
const router = new Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const validateParams = require('../middleware/validateParams');

router.get('/getAll', reviewController.getAllReview);
router.get('/getById/:id', reviewController.getReviewById);
router.get('/getAllByItemIdShown/:itemId',
    validateParams([
        { param: 'itemId', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    reviewController.getAllReviewByItemIdAndIsShowed);
router.get('/getAllByItemId/:itemId',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    reviewController.getAllReviewByItemId);
router.post('/add', authenticateToken, reviewController.addReview);
router.delete('/delete/:id', authenticateToken,
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    requireAdmin, reviewController.deleteReviewById);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, reviewController.updateReviewById);

module.exports = router; 