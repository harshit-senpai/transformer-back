import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Request, Response } from "express";
import PdfParse from "pdf-parse";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const uploadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
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

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: fileType,
  });

  try {
    await s3.send(command);

    let isMachineReadable = false;

    if (fileType === "application/pdf") {
      const data = await PdfParse(fileBuffer);
      isMachineReadable = Boolean(data.text && data.text.trim().length > 0);
    } else if (fileType === "text/plain") {
      const textContent = fileBuffer.toString();
      isMachineReadable = Boolean(textContent && textContent.trim().length > 0);
    } else if (fileType.startsWith("image/")) {
      isMachineReadable = false;
    }

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

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
  } catch (error) {
    console.log("[FILE_UPLOAD_ERROR]: ", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
