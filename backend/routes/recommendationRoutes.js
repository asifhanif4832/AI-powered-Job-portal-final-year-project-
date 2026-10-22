import express from "express";
import { getRecommendations } from "../controllers/recommendationController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/recommendations", isAuthenticated, getRecommendations);

export default router;