import express from "express";
import { countRateStar, createRate, deleteRate, getRateID, getRateSummary, selectRate } from "../Controllers/rateController.js";
import { checkToken } from "../Config/jwtConfig.js";

const rateRoutes = express.Router();

rateRoutes.get("/get-rate-id/:MA_KS", getRateID);
rateRoutes.get("/get-avg-rate/:MA_KS", getRateSummary);
rateRoutes.get("/count-rate-star", checkToken, countRateStar);
rateRoutes.post("/create-rate", checkToken, createRate);
rateRoutes.get("/select-rate/:MA_DG", checkToken, selectRate);
rateRoutes.delete("/delete-rate/:MA_DG", checkToken, deleteRate);

export default rateRoutes;