"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileconverter_routes_1 = __importDefault(require("./routes/fileconverter.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const fileUpload_routes_1 = __importDefault(require("./routes/fileUpload.routes"));
const documents_routes_1 = __importDefault(require("./routes/documents.routes"));
const analyse_routes_1 = __importDefault(require("./routes/analyse.routes"));
const translate_routes_1 = __importDefault(require("./routes/translate.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
dotenv_1.default.config({ path: "../.env" });
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/convert", fileconverter_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/upload", fileUpload_routes_1.default);
app.use("/api/documents", documents_routes_1.default);
app.use("/api/analytics", analyse_routes_1.default);
app.use("/api/translate", translate_routes_1.default);
exports.default = app;
