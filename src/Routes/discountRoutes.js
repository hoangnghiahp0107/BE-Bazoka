import express from "express";
import { createDiscount, createDiscountPartner, deleteDiscount, deleteDiscountPartner, getDiscount, getDiscountPartner, selectDiscount, selectDiscountPartner, updateDiscount, updateDiscountPartner } from "../Controllers/discountController.js";
import { checkToken } from "../Config/jwtConfig.js";

const discountRoutes = express.Router();

discountRoutes.get("/get-discount", getDiscount);
discountRoutes.get("/get-discount-partner", checkToken, getDiscountPartner);
discountRoutes.delete("/delete-discount/:MA_MGG", checkToken, deleteDiscount);
discountRoutes.post("/create-discount", checkToken, createDiscount);
discountRoutes.put("/update-discount/:MA_MGG", checkToken, updateDiscount);
discountRoutes.get("/select-discount/:MA_MGG", selectDiscount);
discountRoutes.get("/select-discount-partner/:MA_KM", selectDiscountPartner);
discountRoutes.post("/create-discount-partner", checkToken, createDiscountPartner);
discountRoutes.put("/update-discount-partner/:MA_KM", checkToken, updateDiscountPartner);
discountRoutes.delete("/delete-discount-partner/:MA_KM", checkToken, deleteDiscountPartner);

export default discountRoutes;