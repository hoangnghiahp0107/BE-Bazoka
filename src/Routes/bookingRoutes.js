import express from "express";
import { accessHoanTien, bookingRoom, bookingRoomPay, cancelBookingUser, createBookingFormPartner, deleteBookingFormPartner, denyHoanTien, getBookingAll, getBookingFormPartner, getBookingUser, getCountBookingMonth, getCountMoneyMonth, selectBooking, updateBookingFormPartner, verifyWebhook } from "../Controllers/bookingController.js";
import { checkToken } from "../Config/jwtConfig.js";
import { getTienNghi } from "../Controllers/localController.js";

const bookingRoutes = express.Router();

bookingRoutes.post("/booking-room-pay", checkToken, bookingRoomPay);
bookingRoutes.post("/confirm-webhook", verifyWebhook);
bookingRoutes.post("/booking-room", checkToken, bookingRoom);
bookingRoutes.get("/get-booking-user", checkToken, getBookingUser);
bookingRoutes.get("/get-booking-all", checkToken, getBookingAll);
bookingRoutes.get("/get-count-booking", checkToken, getCountBookingMonth);
bookingRoutes.get("/get-tiennghi", checkToken, getTienNghi);
bookingRoutes.get("/get-count-money-partner", checkToken, getCountMoneyMonth);
bookingRoutes.put("/cancel-booking-user/:MA_DP", checkToken, cancelBookingUser);
bookingRoutes.get("/get-booking-partner", checkToken, getBookingFormPartner);
bookingRoutes.post("/create-booking-partner", checkToken, createBookingFormPartner);
bookingRoutes.put("/update-booking-partner/:MA_DP", checkToken, updateBookingFormPartner);
bookingRoutes.delete("/delete-booking-partner/:MA_DP", checkToken, deleteBookingFormPartner);
bookingRoutes.get("/select-booking/:MA_DP", selectBooking);
bookingRoutes.put("/deny-booking/:MA_DP", checkToken, denyHoanTien);
bookingRoutes.put("/access-booking/:MA_DP", checkToken, accessHoanTien);

export default bookingRoutes;