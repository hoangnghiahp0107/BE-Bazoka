import express from "express";
import { deleteDiscount, getDiscount } from "../Controllers/discountController.js";

const discountRoutes = express.Router();

discountRoutes.get("/get-discount", getDiscount);
discountRoutes.delete("/delete-discount/:MA_MGG", deleteDiscount);

export default discountRoutes;