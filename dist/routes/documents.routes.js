"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const documents_controller_1 = require("../controllers/documents.controller");
const router = express_1.default.Router();
router.route("/get-document").get(documents_controller_1.getDocuments);
router.route("/get-document/:documentId").get(documents_controller_1.getDocument);
exports.default = router;
