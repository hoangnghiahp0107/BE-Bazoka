import express from "express";
import { createRoom, createRoomPartner, deleteRoom, deleteRoomPartner, getConvenient, getDataRoom, getDataRoomDay, getPrice, getPriceDiscount, getRoom, getRoomPartner, getSearchNameRoom, selectRoom, updateRoom, updateRoomPartner } from "../Controllers/roomController.js";
import { checkToken } from "../Config/jwtConfig.js";

const roomRoutes = express.Router();

roomRoutes.get("/get-room", getRoom);
roomRoutes.post("/create-room", checkToken, createRoom);
roomRoutes.put("/update-room/:MA_PHONG", checkToken, updateRoom);
roomRoutes.delete("/delete-room/:MA_PHONG", checkToken, deleteRoom);
roomRoutes.get("/search-room/:TENPHONG", checkToken, getSearchNameRoom);
roomRoutes.get("select-room", selectRoom);
roomRoutes.get("/get-convenient/:MA_KS", getConvenient)
roomRoutes.get("/get-price/:MA_KS", getPrice);
roomRoutes.get("/get-price-discount/:MA_KS", getPriceDiscount);
roomRoutes.get("/get-data-room/:MA_KS", getDataRoom);
roomRoutes.get("/get-data-room-day/:MA_KS", getDataRoomDay);
roomRoutes.get("/get-room-partner", checkToken, getRoomPartner)
roomRoutes.post("/create-room-partner", checkToken, createRoomPartner)
roomRoutes.put("/update-room-partner/:MA_PHONG", checkToken, updateRoomPartner)
roomRoutes.delete("/delete-room-partner/:MA_PHONG", checkToken, deleteRoomPartner)

export default roomRoutes;