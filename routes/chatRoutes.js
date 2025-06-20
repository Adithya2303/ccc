import express from "express";
import auth from "../middleware/auth.js";
import { getChat, sendMessage } from "../controllers/chatController.js";

const router = express.Router();

router.get("/:otherUserId", auth, getChat);
router.post("/:otherUserId", auth, sendMessage);

export default router; 