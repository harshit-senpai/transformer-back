import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

export const getAnalysis = async (req: Request, res: Response) => {
  try {
    const { text, analysisType } = req.body;

    console.log(text, analysisType);

    const geminiResponse = await run(text, analysisType);

    console.log(geminiResponse);

    res.status(200).json({
      geminiResponse,
    });
  } catch (error) {
    console.log("[GET_ANALYSIS_ERROR]: ", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

async function run(userInput: string, analysisType: string): Promise<string> {
  let prompt = "";

  switch (analysisType) {
    case "sentiment":
      prompt = `Analyze the sentiment of the following text:\n"${userInput}"\nProvide a simple summary explaining the overall sentiment and its implications.`;
      break;
    case "predictive":
      prompt = `Perform predictive analysis on the following text:\n"${userInput}"\nExplain possible future trends, outcomes, or scenarios inferred from the content.`;
      break;
    case "chart":
      prompt = `Perform chart analysis on the following text:\n"${userInput}"\nStructure the data in JSON format for visualization. Ensure the JSON format includes the following:
    {
      "chartKey": {
        "type": "chartType", // e.g., bar, line, pie, etc.
        "labels": ["Label1", "Label2", ...], // Labels for X-axis or categories
        "data": [Value1, Value2, ...], // Corresponding data points
        "title": "Chart Title"
      }
    }
    Ensure the JSON dynamically adapts to the insights extracted from the text.`;
      break;
    case "descriptive":
      prompt = `Perform descriptive analysis on the following text:\n"${userInput}"\nWhich is a JSON format data Summarize the key points and findings in the content using business intelligence techniques making it easy even for a non-technical audience to understand give the summary in 300 characters.`;
      break;
    case "prescriptive":
      prompt = `Perform prescriptive analysis on the following text:\n"${userInput}"\nSuggest optimization or simulation strategies to address potential challenges or improve outcomes.`;
      break;
    case "diagnostic":
      prompt = `Perform diagnostic analysis on the following text:\n"${userInput}"\nIdentify underlying causes, reasons, or root issues discussed in the content.`;
      break;
    default:
      prompt = `Analyze the following text:\n"${userInput}"\nProvide a general analysis.`;
  }

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}
