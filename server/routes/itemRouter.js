const Router = require('express');
const router = new Router();
const itemController = require('../controllers/itemController');
const validateParams = require('../middleware/validateParams');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { processMultipleImages, processVideo } = require('../middleware/MediaProcessor');

router.get('/getAll', itemController.getAllItems);
router.get('/getAllByNameSubst/:substring', itemController.getItemsByNameSubstring);
router.get('/getAllByKategoryId/:kategoryId',
    validateParams([
        { param: 'kategoryId', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    itemController.getAllItemsByKategoryId);
router.get('/getAllJSONBByKategoryId/:kategoryId',
    validateParams([
        { param: 'kategoryId', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    itemController.getAttributeValuesForCategory);
router.get('/getAllByMainKategoryId/:mainKategoryId',
    validateParams([
        { param: 'mainKategoryId', type: 'integer', min: 1, name: 'ID главной категории' }
    ]),
    itemController.getAllItemsByMainKategoryId);
router.get('/getAllByItemGroupId/:itemGroupId',
    validateParams([
        { param: 'itemGroupId', type: 'integer', min: 1, name: 'ID группы товаров' }
    ]),
    itemController.getAllItemsByItemGroupIdId);
router.get('/getItemById/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID товара' }
    ]),
    itemController.getItemById);

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

module.exports = router;