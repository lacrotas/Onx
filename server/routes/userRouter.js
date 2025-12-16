const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const validateParams = require('../middleware/validateParams');

router.post('/login', userController.login);
router.post('/registrate', userController.addUser);
router.get('/auth', userController.check);

router.get('/getAll', userController.getAllUsers);
router.get('/getbyId/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    userController.getUserById);
router.delete('/delete/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    userController.deleteUserById);
router.put('/update/:id',
    validateParams([
        { param: 'id', type: 'integer', min: 1, name: 'ID категории' }
    ]),
    userController.updateUserById);

module.exports = router;