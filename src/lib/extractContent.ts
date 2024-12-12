import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCwSdSNPyIBONTQpALAs6hkhexXd6KL1Ao");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const prompt = `Given file is a Judiciary Ministry's data, we like to extract as much information from it as possible, in form 
of JSON, and do not leave any information even if the data is repeated in same structure`;

function fileToGenerativePart(imageData: string) {
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

export const extractFileData = async (base64: string) => {
  const filePart = fileToGenerativePart(base64);
  const generateContent = await model.generateContent([prompt, filePart]);
  console.log(generateContent);

  const responseText = generateContent.response.text();

  return responseText;
};
