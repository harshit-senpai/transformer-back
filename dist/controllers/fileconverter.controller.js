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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertAndUpload = exports.checkFileAndUpload = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const convertapi_1 = __importDefault(require("convertapi"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const credential_providers_1 = require("@aws-sdk/credential-providers");
const extractContent_1 = require("../lib/extractContent");
const db_1 = require("../lib/db");
const currentUser_1 = require("../utils/currentUser");
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: (0, credential_providers_1.fromEnv)(),
    endpoint: `https://s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com`,
    forcePathStyle: true,
});
const convertApi = new convertapi_1.default(process.env.CONVERTAPI_API_KEY);
const checkFileAndUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileKey } = req.body;
        if (!fileKey) {
            res.status(400).json({
                message: "No file key provided",
            });
            return;
        }
        console.log(fileKey, process.env.AWS_S3_BUCKET_NAME);
        const getObjectCommand = new client_s3_1.GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
        });
        const response = yield s3.send(getObjectCommand);
        const fileBuffer = yield streamToBuffer(response.Body);
        const fileType = response.ContentType;
        if (fileType === "application/pdf") {
            const data = yield (0, pdf_parse_1.default)(fileBuffer);
            if (data.text && data.text.trim().length > 0) {
                res.status(200).json({
                    message: "File is machine-readable.",
                    isMachineReadable: true,
                });
                return;
            }
            res.status(200).json({
                message: "File is not machine-readable.",
                isMachineReadable: false,
            });
            return;
        }
        if (fileType === "text/plain") {
            const fileContent = fileBuffer.toString();
            if (fileContent && fileContent.trim().length > 0) {
                res.status(200).json({
                    message: "File is machine-readable.",
                    isMachineReadable: true,
                });
                return;
            }
            res.status(200).json({
                message: "File is not machine-readable.",
                isMachineReadable: false,
            });
            return;
        }
        if (fileType === null || fileType === void 0 ? void 0 : fileType.startsWith("image/")) {
            res.status(200).json({
                message: "File is an image. Cannot check machine-readability directly.",
                isMachineReadable: false,
            });
            return;
        }
        res.status(400).json({
            message: "Unsupported file type",
            isMachineReadable: false,
        });
    }
    catch (error) {
        console.log("[CHECK_FILE_ERROR]: ", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});
exports.checkFileAndUpload = checkFileAndUpload;
// Helper function to convert stream to buffer
const streamToBuffer = (stream) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, stream_1, stream_1_1;
    var _b, e_1, _c, _d;
    const chunks = [];
    try {
        for (_a = true, stream_1 = __asyncValues(stream); stream_1_1 = yield stream_1.next(), _b = stream_1_1.done, !_b; _a = true) {
            _d = stream_1_1.value;
            _a = false;
            const chunk = _d;
            chunks.push(Buffer.from(chunk));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_a && !_b && (_c = stream_1.return)) yield _c.call(stream_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return Buffer.concat(chunks);
});
const convertAndUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentUser = yield (0, currentUser_1.getCurrentUser)(req);
    const currentUserId = currentUser === null || currentUser === void 0 ? void 0 : currentUser.id;
    if (!currentUserId) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }
    try {
        if (!process.env.CONVERTAPI_API_KEY) {
            console.error("ConvertAPI key is missing");
            res.status(500).json({ message: "ConvertAPI configuration error" });
            return;
        }
        const { fileKey } = req.body;
        if (!fileKey) {
            res.status(400).json({ message: "No file key provided" });
            return;
        }
        try {
            // Get the file from S3
            const getObjectCommand = new client_s3_1.GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: fileKey,
            });
            const response = yield s3.send(getObjectCommand);
            const fileBuffer = yield streamToBuffer(response.Body);
            console.log("File type:", response.ContentType);
            console.log("File size:", fileBuffer.length);
            // Prepare form data for ConvertAPI
            const formData = new FormData();
            const blob = new Blob([fileBuffer], { type: response.ContentType });
            formData.append("File", blob, fileKey);
            // Make request to ConvertAPI
            const convertApiResponse = yield fetch("https://v2.convertapi.com/convert/pdf/to/ocr", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.CONVERTAPI_API_KEY}`,
                },
                body: formData,
            });
            if (!convertApiResponse.ok) {
                throw new Error(`ConvertAPI failed: ${convertApiResponse.statusText}`);
            }
            const result = yield convertApiResponse.json();
            console.log("ConvertAPI response:", result);
            if (!result.Files ||
                !Array.isArray(result.Files) ||
                result.Files.length === 0) {
                throw new Error("Conversion failed - no files in response");
            }
            // Get file data from FileData field
            const fileData = result.Files[0].FileData;
            if (!fileData) {
                throw new Error("No file data in response");
            }
            // Convert base64 to buffer
            const convertedBuffer = Buffer.from(fileData, "base64");
            const pdfData = yield (0, pdf_parse_1.default)(convertedBuffer);
            const textContent = pdfData.text;
            // Upload back to S3
            const newKey = `${fileKey.split(".")[0]}.pdf`;
            const putObjectCommand = new client_s3_1.PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: newKey,
                Body: convertedBuffer,
                ContentType: "application/pdf",
            });
            yield s3.send(putObjectCommand);
            const file = yield (0, extractContent_1.extractFileData)(fileData);
            console.log(file);
            let hasResponded = false;
            // Store in database
            yield db_1.db.file.create({
                data: {
                    fileUrl: `furni-store.s3.ap-south-1.amazonaws.com/${newKey}`,
                    fileData: file,
                    userId: currentUserId,
                },
            });
            // Send final response only once
            if (!hasResponded) {
                res.end(JSON.stringify({
                    message: "File processed and vectorized successfully",
                    convertedFileKey: newKey,
                }));
            }
        }
        catch (conversionError) {
            if (!res.headersSent) {
                console.error("Conversion error details:", conversionError);
                res.status(500).json({
                    message: "File conversion failed",
                    error: conversionError.message,
                });
            }
        }
    }
    catch (error) {
        if (!res.headersSent) {
            console.error("Process error:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error.message,
            });
        }
    }
});
exports.convertAndUpload = convertAndUpload;
