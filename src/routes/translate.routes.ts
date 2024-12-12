import express from "express";
import { translateText, tts } from "../controllers/translate.controller";

const router = express.Router();

router.route("/").post(translateText);
router.route("/tts").post(tts);

export default router;
