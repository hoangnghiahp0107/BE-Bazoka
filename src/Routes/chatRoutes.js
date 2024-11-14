import express from "express";
import { checkToken } from "../Config/jwtConfig.js";
import { getSupport, getSupportAll, sendSupportCustomer, sendSupportHotel } from "../Controllers/chatController.js";

const chatRoutes = express.Router();

// Truyền io vào các hàm controller để gửi tin nhắn qua Socket.IO
chatRoutes.post("/send-support-hotel/:MA_KS", checkToken, sendSupportHotel);
chatRoutes.post("/send-support-customer/:MA_ND", checkToken, sendSupportCustomer);

chatRoutes.get("/get-support-customer/:MA_ND/:MA_KS", checkToken, getSupport);
chatRoutes.get("/get-support-all", checkToken, getSupportAll);

export default chatRoutes;
