const Router = require('express');
const router = new Router();
const sliderController = require('../controllers/sliderController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const validateParams = require('../middleware/validateParams');


router.post('/add', authenticateToken, requireAdmin, sliderController.addSlider);
router.get('/getAll', sliderController.getAllSlider);
router.get('/getById/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    sliderController.getSliderById);
router.delete('/delete/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, sliderController.deleteSliderById);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    authenticateToken, requireAdmin, sliderController.updateSliderById);

module.exports = router; 