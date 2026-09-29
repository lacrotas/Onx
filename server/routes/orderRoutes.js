const Router = require('express');
const router = new Router();
const OrderController = require('../controllers/orderController');
const { authenticateToken, optionalAuth, requireAdmin, requireOwnerOrAdmin } = require('../middleware/authMiddleware');
const validateParams = require('../middleware/validateParams');

// Личные заказы текущего пользователя
router.get('/my-orders', authenticateToken, OrderController.getMyOrders);
// Привязка гостевых заказов к аккаунту
router.post('/link-guest-orders', authenticateToken, OrderController.linkGuestOrders);

router.get('/getById/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID заказа' }
    ]),
    authenticateToken, requireOwnerOrAdmin, OrderController.getOrderById);
router.get('/getAll', authenticateToken, requireAdmin, OrderController.getAllOrders);
router.get('/getAllByUserId/:userId',
    validateParams([
        { param: 'userId', type: 'integer', min: 1, name: 'ID пользователя' }
    ]),
    authenticateToken, requireOwnerOrAdmin, OrderController.getAllOrdersByUserId);
router.post('/add', optionalAuth, OrderController.addOrder);
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