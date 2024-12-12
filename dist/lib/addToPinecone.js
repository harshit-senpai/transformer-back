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
exports.getEmbeddings = void 0;
function getEmbeddings(texts) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("https://api-inference.huggingface.co/pipeline/feature-extraction/mixedbread-ai/mxbai-embed-large-v1", {
            headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: texts,
                options: {
                    pooling: "cls",
                    normalize: true
                }
            })
        });
        const embeddings = yield response.json();
        // Ensure embeddings is an array of arrays (vectors)
        if (!Array.isArray(embeddings[0])) {
            return texts.map(() => embeddings);
        }
        return embeddings;
    });
}
exports.getEmbeddings = getEmbeddings;
