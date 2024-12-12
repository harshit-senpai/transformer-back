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
exports.getCurrentUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../lib/db");
function getCurrentUser(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            console.log("Full request cookies:", req);
            const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "")) ||
                ((_b = req === null || req === void 0 ? void 0 : req.cookies) === null || _b === void 0 ? void 0 : _b.jwt) ||
                "";
            console.log("JWT Token ", token);
            if (!token) {
                return null;
            }
            const decoded = (yield jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET));
            const currentUser = yield db_1.db.user.findUnique({
                where: {
                    id: decoded.id,
                },
            });
            return currentUser;
        }
        catch (error) {
            console.log("[GET_CURRENT_USER]", error);
            return null;
        }
    });
}
exports.getCurrentUser = getCurrentUser;
