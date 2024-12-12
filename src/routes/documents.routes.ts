import express from "express";
import { requireUser } from "../middleware/authenticated";
import { getDocument, getDocuments } from "../controllers/documents.controller";

const router = express.Router();

router.route("/get-document").get(getDocuments);
router.route("/get-document/:documentId").get(getDocument)

export default router;
