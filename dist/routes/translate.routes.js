"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const translate_controller_1 = require("../controllers/translate.controller");
const router = express_1.default.Router();
router.route("/").post(translate_controller_1.translateText);
router.route("/tts").post(translate_controller_1.tts);
exports.default = router;
