import express from "express";
import { uploadFile } from "../controllers/fileUpload.controller";
import { requireUser } from "../middleware/authenticated";

const router = express.Router();

router.route("/").post(uploadFile);

export default router;
