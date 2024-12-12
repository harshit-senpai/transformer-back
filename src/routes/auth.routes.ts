import express from "express";
import { login, logout, signup } from "../controllers/auth.controller";
import { requireUser } from "../middleware/authenticated";

const router = express.Router();

router.route("/sign-up").post(signup);
router.route("/login").post(login);
router.route("/logout").post(logout);

export default router;
