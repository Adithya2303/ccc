import express from "express";
import auth from "../middleware/auth.js";
import { getSkills, updateSkills } from "../controllers/skillsController.js";
const router = express.Router();

router.get("/", auth, getSkills);
router.post("/", auth, updateSkills);

export default router; 