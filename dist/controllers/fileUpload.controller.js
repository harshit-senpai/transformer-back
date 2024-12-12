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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileName, fileType, fileContent } = req.body;
    if (!fileName || !fileType || !fileContent) {
        res.status(400).json({
            message: "Missing required fields",
        });
        return;
    }
    const key = `${Date.now()}-${fileName}`;
    const base64Data = fileContent.split("base64,")[1];
    const fileBuffer = Buffer.from(base64Data, "base64");
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: fileType,
    });
    try {
        yield s3.send(command);
        let isMachineReadable = false;
        if (fileType === "application/pdf") {
            const data = yield (0, pdf_parse_1.default)(fileBuffer);
            isMachineReadable = Boolean(data.text && data.text.trim().length > 0);
        }
        else if (fileType === "text/plain") {
            const textContent = fileBuffer.toString();
            isMachineReadable = Boolean(textContent && textContent.trim().length > 0);
        }
        else if (fileType.startsWith("image/")) {
            isMachineReadable = false;
        }
        const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
        res.status(200).json({
            data: {
                url: signedUrl,
                key,
                fileName,
                fileType,
                isMachineReadable,
                needsCOnversion: !isMachineReadable,
            },
        });
    }
    catch (error) {
        console.log("[FILE_UPLOAD_ERROR]: ", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});
exports.uploadFile = uploadFile;
