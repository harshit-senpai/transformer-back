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
exports.logout = exports.login = exports.signup = void 0;
const db_1 = require("../lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signToken = (id) => {
    const secret = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign({ id }, secret, {
        expiresIn: `${process.env.JWT_EXPIRES_IN}d`,
    });
};
const createSendToken = (user, statusCode, res, message) => {
    const token = signToken(user.id);
    const expiry = Number(process.env.JWT_COOKIE_EXPIRES_IN);
    const cookieOptions = {
        expires: new Date(Date.now() + expiry * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
    };
    res.cookie("jwt", token, cookieOptions);
    res.status(statusCode).json({
        token,
        message,
        user,
    });
};
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                message: "All fields are required",
            });
            return;
        }
        const existingUser = yield db_1.db.user.findUnique({
            where: {
                email,
            },
        });
        if (existingUser) {
            res.status(400).json({
                message: "Email already in use",
            });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield db_1.db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        createSendToken(user, 201, res, "User created");
    }
    catch (error) {
        console.log("[SIGN_UP_ERROR]", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                message: "All fields are required",
            });
            return;
        }
        const user = yield db_1.db.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const correctPassword = yield bcryptjs_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
        if (!correctPassword) {
            res.status(400).json({
                message: "invalid credentials",
            });
            return;
        }
        createSendToken(user, 200, res, "user logged in");
    }
    catch (error) {
        console.log("[LOGIN_ERROR]", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.cookie("jwt", "loggedout", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });
        res.status(200).json({
            message: "User logged out successfully",
        });
    }
    catch (error) {
        console.log("[LOGOUT_ERROR]", error);
        res.status(500).json({
            message: "internal server error",
        });
    }
});
exports.logout = logout;
