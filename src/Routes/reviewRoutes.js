import express from "express";
import { getReviews, createReview, selectReview, updateReview, deleteReview, getReviewsByRoomId, getReviewsByHotelId } 
from "../Controllers/reviewController.js";
import { checkToken } from "../Config/jwtConfig.js";

const reviewRoutes = express.Router();

reviewRoutes.get("/get-review", getReviews);
reviewRoutes.post("/create-review", checkToken, createReview);
reviewRoutes.get("/get-review/:MA_DG", selectReview);
reviewRoutes.put("/update-review/:MA_DG", checkToken, updateReview);
reviewRoutes.delete("/delete-review/:MA_DG", checkToken, deleteReview);
reviewRoutes.get("/room/:MA_PHONG", getReviewsByRoomId);
reviewRoutes.get("/hotel", getReviewsByHotelId);

export default reviewRoutes;