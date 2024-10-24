import express from "express";
import { createHotel, deleteHotel, getHotel, getHotelCountry, getHotelID, getHotelLocal, getSearchNameHotel, selectHotel, updateHotel } from "../Controllers/hotelController.js";
import { checkToken } from "../Config/jwtConfig.js";

const hotelRoutes = express.Router();

hotelRoutes.get("/get-hotel", getHotel);
hotelRoutes.post("/create-hotel", checkToken, createHotel);
hotelRoutes.put("/update-hotel/:MA_KS", checkToken, updateHotel);
hotelRoutes.delete("/delete-hotel/:MA_KS", checkToken, deleteHotel);
hotelRoutes.get("/search-hotel/:searchParam", getSearchNameHotel);
hotelRoutes.get("select-hotel/:TEN_KS", selectHotel);
hotelRoutes.get("/get-hotel-local/:MA_VITRI", getHotelLocal);
hotelRoutes.get("/get-hotel-country/:MA_QUOCGIA", getHotelCountry);
hotelRoutes.get("/get-hotel-id/:MA_KS", getHotelID);


export default hotelRoutes;
