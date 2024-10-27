import express from "express";
import { getAllLocation, getCountry, getProvince } from "../Controllers/localController.js";

const localRoutes = express.Router();

localRoutes.get("/get-country", getCountry);
localRoutes.get("/get-province/:MA_QUOCGIA", getProvince);
localRoutes.get("/get-all-location", getAllLocation);

export default localRoutes;