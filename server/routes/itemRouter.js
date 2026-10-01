const Router = require('express');
const router = new Router();
const itemController = require('../controllers/itemController');
const validateParams = require('../middleware/validateParams');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { processMultipleImages, processVideo } = require('../middleware/MediaProcessor');

router.get('/getAll', itemController.getAllItems);

// get by params
router.get('/getItemByParam/:param', itemController.getItemById);
router.get('/getAllByKategoryId/:id',
    validateParams([
        { param: 'categoryId', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    itemController.getAllItemsByCategoryId);
router.get('/getAllByItemGroupId/:itemGroupId',
    validateParams([
        { param: 'itemGroupId', type: 'integer', min: 1, name: 'ID группы товаров' }
    ]),
    itemController.getAllItemsByItemGroupId);
// for getting all possible variation for filter
router.get('/getAllJSONBByKategoryId/:categoryId',
    validateParams([
        { param: 'kategoryId', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    itemController.getAttributeValuesForCategory);
// for search
router.get('/getAllByNameSubst/:substring', itemController.getItemsByNameSubstring);

// methods
router.post('/add', authenticateToken, requireAdmin,
    processMultipleImages('images', 'images'),
    processVideo('video', 'video'),
    itemController.addItem);
router.delete('/delete/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID товара' }
    ]), authenticateToken, requireAdmin,
    itemController.deleteItemById);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID товара' }
    ]), authenticateToken, requireAdmin,
    processMultipleImages('images', 'images'),
    processVideo('video', 'video'),
    itemController.updateItemById);
router.post('/bulkUpdate', authenticateToken, requireAdmin, itemController.bulkUpdateItems);

module.exports = router;