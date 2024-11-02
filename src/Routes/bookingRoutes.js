import express from "express";
import { bookingRoom, bookingRoomPay, cancelBookingUser, createBookingFormPartner, deleteBookingFormPartner, getBookingAll, getBookingFormPartner, getBookingUser, updateBookingFormPartner, verifyWebhook } from "../Controllers/bookingController.js";
import { checkToken } from "../Config/jwtConfig.js";

const bookingRoutes = express.Router();

bookingRoutes.post("/booking-room-pay", checkToken, bookingRoomPay);
bookingRoutes.post("/confirm-webhook", verifyWebhook);
bookingRoutes.post("/booking-room", checkToken, bookingRoom);
bookingRoutes.get("/get-booking-user", checkToken, getBookingUser);
bookingRoutes.get("/get-booking", checkToken, getBookingAll);
bookingRoutes.put("/cancel-booking-user/:MA_DP", checkToken, cancelBookingUser);
bookingRoutes.get("/get-booking-partner", checkToken, getBookingFormPartner);
bookingRoutes.post("/create-booking-partner", checkToken, createBookingFormPartner);
bookingRoutes.put("/update-booking-partner/:MA_DP", checkToken, updateBookingFormPartner);
bookingRoutes.delete("/delete-booking-partner/:MA_DP", checkToken, deleteBookingFormPartner);
export default bookingRoutes;