const Router = require('express');
const router = new Router();
const ItemGroupController = require('../controllers/ItemGroupController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const validateParams = require('../middleware/validateParams');


router.get('/getAll', ItemGroupController.getAllItemGroup);
router.get('/getById/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    ItemGroupController.getItemGroupById);

router.post('/add', authenticateToken, requireAdmin, ItemGroupController.addItemGroup);
router.delete('/delete/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, ItemGroupController.deleteItemGroupById);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, ItemGroupController.updateItemGroupById);

module.exports = router;