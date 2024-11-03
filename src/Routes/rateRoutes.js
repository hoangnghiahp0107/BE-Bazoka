import express from "express";
import { countRateStar, getRateID, getRateSummary } from "../Controllers/rateController.js";
import { checkToken } from "../Config/jwtConfig.js";

const rateRoutes = express.Router();

rateRoutes.get("/get-rate-id/:MA_KS", getRateID);
rateRoutes.get("/get-avg-rate/:MA_KS", getRateSummary);
rateRoutes.get("/count-rate-star", checkToken, countRateStar);

export default rateRoutes;