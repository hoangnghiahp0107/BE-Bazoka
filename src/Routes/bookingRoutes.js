import express from "express";
import { bookingRoom, verifyWebhook } from "../Controllers/bookingController.js";
import { checkToken } from "../Config/jwtConfig.js";

const bookingRoutes = express.Router();

bookingRoutes.post("/booking-room", checkToken, bookingRoom);
bookingRoutes.post("/payment-webhook", verifyWebhook);

export default bookingRoutes;