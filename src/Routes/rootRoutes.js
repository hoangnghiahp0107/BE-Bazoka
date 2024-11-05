import express from 'express';
import userRoutes from './userRoutes.js';
import roomRoutes from './roomRoutes.js';
import hotelRoutes from './hotelRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import discountRoutes from './discountRoutes.js';
import localRoutes from './localRoutes.js';
import rateRoutes from './rateRoutes.js';
import reviewRoutes from './reviewRoutes.js';

const rootRouter = express.Router();

rootRouter.use("/user", [userRoutes]);
rootRouter.use("/room", [roomRoutes]);
rootRouter.use("/hotel", [hotelRoutes]);
rootRouter.use("/booking", [bookingRoutes]);
rootRouter.use("/discount", [discountRoutes]);
rootRouter.use("/local", [localRoutes]);
rootRouter.use("/rate", [rateRoutes]);
rootRouter.use("/review", [reviewRoutes]);

export default rootRouter;
