const Router = require('express');
const router = new Router();

/* user routers */
const userRouter = require('./userRouter');
const orderRouter = require('./orderRoutes');
const busketRouter = require('./busketRouter');

router.use('/orderRouter', orderRouter);
router.use('/user', userRouter)
router.use('/busketRouter', busketRouter)

/* kategory routers */
const CategoryRouter = require('./categoryRouter');

router.use('/categoryRouter', CategoryRouter);

/* item routers */
const attributeRouter = require('./attributeRouter');
const itemRouter = require('./itemRouter');
const reviewRouter = require('./reviewRouter');
const itemGroupRouter = require('./itemGroupRouter');

router.use('/attributeRouter', attributeRouter);
router.use('/itemRouter', itemRouter);
router.use('/reviewRouter', reviewRouter);
router.use('/itemGroupRouter', itemGroupRouter);

// unlinket routes
const sliderRouter = require('./sliderRouter');
const qwestionRouter = require('./qwestionRouter');


router.use('/sliderRouter', sliderRouter);
router.use('/qwestionRouter', qwestionRouter);


module.exports = router;