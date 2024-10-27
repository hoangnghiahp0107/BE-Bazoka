import express from "express";
import { bookingRoom, bookingRoomPay, verifyWebhook } from "../Controllers/bookingController.js";
import { checkToken } from "../Config/jwtConfig.js";

const bookingRoutes = express.Router();

bookingRoutes.post("/booking-room-pay", checkToken, bookingRoomPay);
bookingRoutes.post("/confirm-webhook", verifyWebhook);
bookingRoutes.post("/booking-room", checkToken, bookingRoom);

export default bookingRoutes;