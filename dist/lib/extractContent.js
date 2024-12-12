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
exports.extractFileData = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI("AIzaSyCwSdSNPyIBONTQpALAs6hkhexXd6KL1Ao");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
});
const prompt = `Given file is a Judiciary Ministry's data, we like to extract as much information from it as possible, in form 
of JSON, and do not leave any information even if the data is repeated in same structure`;
function fileToGenerativePart(imageData) {
    const base64Data = imageData.includes("base64,")
        ? imageData.split("base64,")[1]
        : imageData;
    return {
        inlineData: {
            data: base64Data,
            mimeType: "application/pdf",
        },
    };
}
const extractFileData = (base64) => __awaiter(void 0, void 0, void 0, function* () {
    const filePart = fileToGenerativePart(base64);
    const generateContent = yield model.generateContent([prompt, filePart]);
    console.log(generateContent);
    const responseText = generateContent.response.text();
    return responseText;
});
exports.extractFileData = extractFileData;
