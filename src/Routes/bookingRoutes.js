import express from "express";
import { bookingRoom, bookingRoomPay, cancelBookingUser, getBookingUser, verifyWebhook } from "../Controllers/bookingController.js";
import { checkToken } from "../Config/jwtConfig.js";

const bookingRoutes = express.Router();

bookingRoutes.post("/booking-room-pay", checkToken, bookingRoomPay);
bookingRoutes.post("/confirm-webhook", verifyWebhook);
bookingRoutes.post("/booking-room", checkToken, bookingRoom);
bookingRoutes.get("/get-booking-user", checkToken, getBookingUser);
bookingRoutes.put("/cancel-booking-user/:MA_DP", checkToken, cancelBookingUser);

export default bookingRoutes;