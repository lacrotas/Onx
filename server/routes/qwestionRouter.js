const Router = require('express');
const router = new Router();
const qwestionController = require('../controllers/qwestionController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const validateParams = require('../middleware/validateParams');


router.post('/add', authenticateToken, requireAdmin, qwestionController.addQwestion);
router.get('/getAll', qwestionController.getAllQwestion);
router.delete('/delete/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, qwestionController.deleteQwestionById);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, qwestionController.updateQwestionById);

module.exports = router; 