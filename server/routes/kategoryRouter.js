const Router = require('express');
const router = new Router();
const kategoryController = require('../controllers/kategoryController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { processSingleImage } = require('../middleware/MediaProcessor');
const validateParams = require('../middleware/validateParams');


router.get('/getKategory/:id', kategoryController.getKategoryById);
router.get('/getAll', kategoryController.getAllKategory);
router.get('/getAllKategory/:mainKategoryId',
    validateParams([
        { param: 'mainKategoryId', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    kategoryController.getAllKategoryByMainKategoryId);
router.post('/add', authenticateToken, requireAdmin, processSingleImage('image', 'images'), kategoryController.addKategory);
router.delete('/delete/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, kategoryController.deleteKategoryById);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, processSingleImage('image', 'images'), kategoryController.updateKategoryById);

module.exports = router;