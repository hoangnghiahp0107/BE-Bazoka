import express from "express";
import { createTienNghi, getAllDiaDiem, getAllLocation, getCountry, getProvince, getTienNghi } from "../Controllers/localController.js";
import { checkToken } from "../Config/jwtConfig.js";

const localRoutes = express.Router();

localRoutes.get("/get-country", getCountry);
localRoutes.get("/get-all-diadiem", getAllDiaDiem);
localRoutes.get("/get-province/:MA_QUOCGIA", getProvince);
localRoutes.get("/get-all-location", getAllLocation);
localRoutes.get("/get-tien-nghi", checkToken, getTienNghi);
localRoutes.post("/create-tiennghi", checkToken, createTienNghi);

export default localRoutes;