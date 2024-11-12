import express from "express";
import { bookingRoom, bookingRoomPay, cancelBookingUser, createBookingFormPartner, deleteBookingFormPartner, getBookingAll, getBookingFormPartner, getBookingUser, getCountBookingMonth, getCountMoneyMonth, selectBooking, updateBookingFormPartner, verifyWebhook } from "../Controllers/bookingController.js";
import { checkToken } from "../Config/jwtConfig.js";

const bookingRoutes = express.Router();

bookingRoutes.post("/booking-room-pay", checkToken, bookingRoomPay);
bookingRoutes.post("/confirm-webhook", verifyWebhook);
bookingRoutes.post("/booking-room", checkToken, bookingRoom);
bookingRoutes.get("/get-booking-user", checkToken, getBookingUser);
bookingRoutes.get("/get-booking-all", checkToken, getBookingAll);
bookingRoutes.get("/get-count-booking", checkToken, getCountBookingMonth);
bookingRoutes.get("/get-count-money-partner", checkToken, getCountMoneyMonth);
bookingRoutes.put("/cancel-booking-user/:MA_DP", checkToken, cancelBookingUser);
bookingRoutes.get("/get-booking-partner", checkToken, getBookingFormPartner);
bookingRoutes.post("/create-booking-partner", checkToken, createBookingFormPartner);
bookingRoutes.put("/update-booking-partner/:MA_DP", checkToken, updateBookingFormPartner);
bookingRoutes.delete("/delete-booking-partner/:MA_DP", checkToken, deleteBookingFormPartner);
bookingRoutes.get("/select-booking/:MA_DP", selectBooking);

export default bookingRoutes;