"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileconverter_controller_1 = require("../controllers/fileconverter.controller");
const router = express_1.default.Router();
router.route("/").post(fileconverter_controller_1.convertAndUpload);
router.route("/check").post(fileconverter_controller_1.checkFileAndUpload);
exports.default = router;
