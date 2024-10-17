import express from 'express';
import userRoutes from './userRoutes.js';
import roomRoutes from './roomRoutes.js';
import hotelRoutes from './hotelRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import discountRoutes from './discountRoutes.js';
import localRoutes from './localRoutes.js';
import rateRoutes from './rateRoutes.js';
<<<<<<< HEAD
import reviewRoutes from './reviewRoutes.js'; // Thêm import cho reviewRoutes

=======
import reviewRoutes from './reviewRoutes.js';
>>>>>>> c307a6f952c444fb9a15bcd1c7bcbff7887c1891
const rootRouter = express.Router();

rootRouter.use("/user", [userRoutes]);
rootRouter.use("/room", [roomRoutes]);
rootRouter.use("/hotel", [hotelRoutes]);
rootRouter.use("/booking", [bookingRoutes]);
rootRouter.use("/discount", [discountRoutes]);
rootRouter.use("/local", [localRoutes]);
rootRouter.use("/rate", [rateRoutes])
rootRouter.use("/reviews", [reviewRoutes]); // Kết nối các routes cho reviews

export default rootRouter;
