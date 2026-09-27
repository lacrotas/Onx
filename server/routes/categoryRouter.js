const Router = require('express');
const router = new Router();
const CategoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { processSingleImage } = require('../middleware/MediaProcessor');
const validateParams = require('../middleware/validateParams');

router.get('/getAll', CategoryController.getAllCategory);
router.get('/getAllMainCategory', CategoryController.getAllMainCategory);

// get by param
router.get('/getParentCategoryByParam/:id', CategoryController.getAllCategoryByParentId);
router.get('/getAllKategory/:id', CategoryController.getAllCategoryByParentId);
router.get('/getCategoryByParam/:param', CategoryController.getCategoryById);

// methots
router.post('/add', authenticateToken, requireAdmin, processSingleImage('image', 'images'), CategoryController.addCategory);
router.delete('/delete/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, CategoryController.deleteCategoryById);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, processSingleImage('image', 'images'), CategoryController.updateCategoryById);

module.exports = router;