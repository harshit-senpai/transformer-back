import { Request, Response } from "express";
import { db } from "../lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentUser } from "../utils/currentUser";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

export const getDocuments = async (req: Request, res: Response) => {
  const currentUser = await getCurrentUser(req);

  const currentUserId = currentUser?.id;

  try {
    const documents = await db.file.findMany({
      where: {
        id: currentUserId,
      },
    });
    console.log(documents);

    res.status(200).json({
      documents,
    });
  } catch (error) {
    console.log("[GET_DOCUMENTS_ERROR]: ", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
       res.status(400).json({
        message: "Document ID is required"
      });
      return
    }

    const document = await db.file.findUnique({
      where: {
        id: documentId
      }
    });

    if (!document) {
       res.status(404).json({
        message: "Document not found"
      });
      return
    }

     res.status(200).json({
      document
    });
  } catch (error) {
    console.log("[GET_DOCUMENT_ERROR]: ", error);
     res.status(500).json({
      message: "Internal server error"
    });
    return
  }
};