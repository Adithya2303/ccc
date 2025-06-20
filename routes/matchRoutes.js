import express from "express";
import auth from "../middleware/auth.js";
import { findMatches } from "../controllers/matchController.js";
const router = express.Router();

router.get("/", auth, findMatches);

export default router; 