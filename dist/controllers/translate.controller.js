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
exports.tts = exports.translateText = void 0;
const translateText = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { input, target_language_code } = req.body || {};
    console.log(input, target_language_code);
    // Validate required fields
    if (!input || !target_language_code) {
        res.status(400).json({
            error: "Missing required fields: 'input' or 'target_language_code'.",
        });
        return;
    }
    try {
        const response = yield fetch("https://api.sarvam.ai/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-subscription-key": "372386a1-9075-4c7a-b24b-37b983eb22c3",
            },
            body: JSON.stringify({
                input,
                source_language_code: "en-IN", // Defaulting to English (India)
                target_language_code, // Defaulting to English (
                speaker_gender: "Female",
                mode: "formal",
                model: "mayura:v1",
                enable_preprocessing: true,
            }),
        });
        if (!response.ok) {
            const errorResponse = yield response.json();
            res.status(response.status).json({
                error: errorResponse.message || "Failed to translate text.",
            });
            return;
        }
        const data = yield response.json();
        const translatedText = data === null || data === void 0 ? void 0 : data.translated_text;
        if (!translatedText) {
            res.status(500).json({
                error: "Translation response is missing the 'translated_text' field.",
            });
            return;
        }
        res.status(200).json({ translated_text: translatedText });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error occurred." });
    }
});
exports.translateText = translateText;
const tts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { text, target_language_code } = req.body || {};
    if (!text || !target_language_code) {
        res.status(400).json({ error: "Missing required fields." });
        return;
    }
    try {
        console.log("TTS API Request Body:", { text, target_language_code });
        const response = yield fetch("https://api.sarvam.ai/text-to-speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-subscription-key": "372386a1-9075-4c7a-b24b-37b983eb22c3",
            },
            body: JSON.stringify({
                target_language_code,
                inputs: [text],
                speaker: "meera",
                pitch: 0,
                pace: 1.0,
                loudness: 1.0,
                speech_sample_rate: 8000,
                enable_preprocessing: true,
            }),
        });
        if (!response.ok) {
            const errorResponse = yield response.json();
            console.error("TTS API Error Response:", errorResponse);
            res.status(response.status).json({
                error: errorResponse.message || "Failed to fetch audio from TTS API",
            });
            return;
        }
        const data = yield response.json();
        const base64Audio = (_a = data === null || data === void 0 ? void 0 : data.audios) === null || _a === void 0 ? void 0 : _a[0];
        if (!base64Audio) {
            res.status(500).json({ error: "No audio data returned by the API." });
            return;
        }
        // Decode base64 to binary
        const audioBuffer = Buffer.from(base64Audio, "base64");
        // Set response headers and send the binary audio data
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader("Content-Length", audioBuffer.length);
        res.status(200).send(audioBuffer);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error occurred." });
    }
});
exports.tts = tts;
