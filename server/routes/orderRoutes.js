const Router = require('express');
const router = new Router();
const OrderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin, requireOwnerOrAdmin } = require('../middleware/authMiddleware');
const validateParams = require('../middleware/validateParams');


router.get('/getById/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireOwnerOrAdmin, OrderController.getOrderById);
router.get('/getAll', authenticateToken, requireAdmin, OrderController.getAllOrders);
router.get('/getAllByUserId/:userId',
    validateParams([
        { param: 'userId', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireOwnerOrAdmin, OrderController.getAllOrdersByUserId);
router.post('/add', authenticateToken, OrderController.addOrder);
router.delete('/delete/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireOwnerOrAdmin, OrderController.deleteOrderById);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, OrderController.updateOrderById);
module.exports = router;