import express from "express";
import { checkFileAndUpload, convertAndUpload } from "../controllers/fileconverter.controller";
import { requireUser } from "../middleware/authenticated";

const router = express.Router();

router.route("/").post(convertAndUpload);
router.route("/check").post(checkFileAndUpload);

export default router;
