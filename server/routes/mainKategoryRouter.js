const Router = require('express');
const router = new Router();
const MainKategoryController = require('../controllers/mainKategoryController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { processSingleImage } = require('../middleware/MediaProcessor');
const validateParams = require('../middleware/validateParams');

router.get('/getAll', MainKategoryController.getAllMainKategory);
router.get('/getMainKategoryById/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    MainKategoryController.getMainKategoryById);
router.post('/add', authenticateToken, requireAdmin, processSingleImage('image', 'images'), MainKategoryController.addMainKategory);
router.delete('/delete/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, MainKategoryController.deleteMainKategoryById);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, processSingleImage('image', 'images'), MainKategoryController.updateMainKategoryById);

module.exports = router;