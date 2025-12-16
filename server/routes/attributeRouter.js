const Router = require('express');
const router = new Router();
const attributeController = require('../controllers/attributeController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const validateParams = require('../middleware/validateParams');


router.get('/getAllByKategoryId/:kategoryId',
    validateParams([
        { param: 'kategoryId', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    attributeController.getAllAttributeByKategoryId);
router.get('/getById/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    attributeController.getAttributeById);
router.get('/getAll', attributeController.getAllAttribute);
router.post('/add', authenticateToken, requireAdmin, attributeController.addAttribute);
router.delete('/delete/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, attributeController.deleteAttributeById);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, attributeController.updateAttributeById);

module.exports = router; 