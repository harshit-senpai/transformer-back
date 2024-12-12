"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analysis_controller_1 = require("../controllers/analysis.controller");
const router = express_1.default.Router();
router.route("/get-analysis").post(analysis_controller_1.getAnalysis);
exports.default = router;
