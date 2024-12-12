import express from "express";
import { getAnalysis } from "../controllers/analysis.controller";

const router = express.Router();

router.route("/get-analysis").post(getAnalysis);

export default router;