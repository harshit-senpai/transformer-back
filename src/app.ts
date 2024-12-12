import express from "express";
import fileConverterRoutes from "./routes/fileconverter.routes";
import authRoutes from "./routes/auth.routes";
import fileUploadRoutes from "./routes/fileUpload.routes";
import docRoutes from "./routes/documents.routes";
import analyticsRoutes from "./routes/analyse.routes";
import translateRoutes from "./routes/translate.routes";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
dotenv.config({ path: "../.env" });
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);

app.use(cookieParser());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/convert", fileConverterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", fileUploadRoutes);
app.use("/api/documents", docRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/translate", translateRoutes);

export default app;
