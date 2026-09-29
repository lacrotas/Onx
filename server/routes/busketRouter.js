const Router = require('express');
const router = new Router();
const BusketController = require('../controllers/busketController');
const { authenticateToken, requireOwnerOrAdmin, requireBusketOwnerOrAdmin } = require('../middleware/authMiddleware');
const validateParams = require('../middleware/validateParams');


router.get('/getAll', BusketController.getAllBusket);
router.get('/getAllByUserId/:userId',
    validateParams([
        { param: 'userId', type: 'integer', min: 1, name: 'ID пользователя' }
    ]),
    authenticateToken, requireOwnerOrAdmin, BusketController.getBusketByUserId);
router.delete('/delete/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID корзины' }
    ]),
    authenticateToken, requireBusketOwnerOrAdmin, BusketController.deleteBusketById);
router.post('/add', authenticateToken, requireOwnerOrAdmin, BusketController.addBusket);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID корзины' }
    ]),
    authenticateToken, requireBusketOwnerOrAdmin, BusketController.updateBusketById);
router.put('/updateByUserId/:userId',
    validateParams([
        { param: 'userId', type: 'integer', min: 1, name: 'ID пользователя' }
    ]),
    authenticateToken, requireOwnerOrAdmin, BusketController.updateBusketByUserId);

module.exports = router;