import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Request, Response } from "express";
import ConvertAPI from "convertapi";
import pdfParse from "pdf-parse";
import { fromEnv } from "@aws-sdk/credential-providers";
import { extractFileData } from "../lib/extractContent";
import { db } from "../lib/db";
import { getCurrentUser } from "../utils/currentUser";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddings } from "../lib/addToPinecone";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: fromEnv(),
  endpoint: `https://s3.${
    process.env.AWS_REGION || "ap-south-1"
  }.amazonaws.com`,
  forcePathStyle: true,
});

const convertApi = new ConvertAPI(process.env.CONVERTAPI_API_KEY!);

export const checkFileAndUpload = async (req: Request, res: Response) => {
  try {
    const { fileKey } = req.body;

    if (!fileKey) {
      res.status(400).json({
        message: "No file key provided",
      });
      return;
    }

    console.log(fileKey, process.env.AWS_S3_BUCKET_NAME);

    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    });

    const response = await s3.send(getObjectCommand);

    const fileBuffer = await streamToBuffer(response.Body);
    const fileType = response.ContentType;

    if (fileType === "application/pdf") {
      const data = await pdfParse(fileBuffer);
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

    if (fileType?.startsWith("image/")) {
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
  } catch (error) {
    console.log("[CHECK_FILE_ERROR]: ", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Helper function to convert stream to buffer
const streamToBuffer = async (stream: any): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

export const convertAndUpload = async (req: Request, res: Response) => {
  const currentUser = await getCurrentUser(req);
  const currentUserId = currentUser?.id;

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
      const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: fileKey,
      });
      const response = await s3.send(getObjectCommand);
      const fileBuffer = await streamToBuffer(response.Body);

      console.log("File type:", response.ContentType);
      console.log("File size:", fileBuffer.length);

      // Prepare form data for ConvertAPI
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: response.ContentType });
      formData.append("File", blob, fileKey);

      // Make request to ConvertAPI
      const convertApiResponse = await fetch(
        "https://v2.convertapi.com/convert/pdf/to/ocr",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CONVERTAPI_API_KEY}`,
          },
          body: formData,
        }
      );

      if (!convertApiResponse.ok) {
        throw new Error(`ConvertAPI failed: ${convertApiResponse.statusText}`);
      }

      const result = await convertApiResponse.json();
      console.log("ConvertAPI response:", result);

      if (
        !result.Files ||
        !Array.isArray(result.Files) ||
        result.Files.length === 0
      ) {
        throw new Error("Conversion failed - no files in response");
      }

      // Get file data from FileData field
      const fileData = result.Files[0].FileData;
      if (!fileData) {
        throw new Error("No file data in response");
      }

      // Convert base64 to buffer
      const convertedBuffer = Buffer.from(fileData, "base64");

      const pdfData = await pdfParse(convertedBuffer);
      const textContent = pdfData.text;

      // Upload back to S3
      const newKey = `${fileKey.split(".")[0]}.pdf`;
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: newKey,
        Body: convertedBuffer,
        ContentType: "application/pdf",
      });

      await s3.send(putObjectCommand);

      const file = await extractFileData(fileData);

      console.log(file);

      let hasResponded = false;

      // Store in database
      await db.file.create({
        data: {
          fileUrl: `furni-store.s3.ap-south-1.amazonaws.com/${newKey}`,
          fileData: file,
          userId: currentUserId,
        },
      });

      // Send final response only once
      if (!hasResponded) {
        res.end(
          JSON.stringify({
            message: "File processed and vectorized successfully",
            convertedFileKey: newKey,
          })
        );
      }

    } catch (conversionError: any) {
      if (!res.headersSent) {
        console.error("Conversion error details:", conversionError);
        res.status(500).json({
          message: "File conversion failed",
          error: conversionError.message,
        });
      }
    }
  } catch (error: any) {
    if (!res.headersSent) {
      console.error("Process error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};
