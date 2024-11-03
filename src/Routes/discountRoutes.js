import express from "express";
import { createDiscount, deleteDiscount, getDiscount, selectDiscount, updateDiscount } from "../Controllers/discountController.js";
import { checkToken } from "../Config/jwtConfig.js";

const discountRoutes = express.Router();

discountRoutes.get("/get-discount", getDiscount);
discountRoutes.delete("/delete-discount/:MA_MGG", checkToken, deleteDiscount);
discountRoutes.post("/create-discount", checkToken, createDiscount);
discountRoutes.put("/update-discount/:MA_MGG", checkToken, updateDiscount);
discountRoutes.get("/select-discount/:MA_MGG", selectDiscount);

export default discountRoutes;