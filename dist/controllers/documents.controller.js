"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocument = exports.getDocuments = void 0;
const db_1 = require("../lib/db");
const generative_ai_1 = require("@google/generative-ai");
const currentUser_1 = require("../utils/currentUser");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
});
const getDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentUser = yield (0, currentUser_1.getCurrentUser)(req);
    const currentUserId = currentUser === null || currentUser === void 0 ? void 0 : currentUser.id;
    try {
        const documents = yield db_1.db.file.findMany({
            where: {
                id: currentUserId,
            },
        });
        console.log(documents);
        res.status(200).json({
            documents,
        });
    }
    catch (error) {
        console.log("[GET_DOCUMENTS_ERROR]: ", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});
exports.getDocuments = getDocuments;
const getDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId } = req.params;
        if (!documentId) {
            res.status(400).json({
                message: "Document ID is required"
            });
            return;
        }
        const document = yield db_1.db.file.findUnique({
            where: {
                id: documentId
            }
        });
        if (!document) {
            res.status(404).json({
                message: "Document not found"
            });
            return;
        }
        res.status(200).json({
            document
        });
    }
    catch (error) {
        console.log("[GET_DOCUMENT_ERROR]: ", error);
        res.status(500).json({
            message: "Internal server error"
        });
        return;
    }
});
exports.getDocument = getDocument;
