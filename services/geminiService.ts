import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    // Process.env.API_KEY is assumed to be available as per instructions
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const sendMessageToGemini = async (
  message: string, 
  contextData: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // We use the 2.5 flash model for quick text interactions
    const model = 'gemini-2.5-flash';

    const prompt = `
    Context Data (JSON):
    ${contextData}

    User Question:
    ${message}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "I processed the request but received no text response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with the AI assistant.");
  }
};

export const extractInvoiceData = async (base64Data: string, mimeType: string): Promise<any> => {
  try {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
             text: "Analyze this image. If it is an invoice, extract the following details into a JSON object: invoiceNo, clientName, amount (number), taxAmount (number), date (YYYY-MM-DD), dueDate (YYYY-MM-DD). If a specific field is not visible, use null."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            invoiceNo: { type: Type.STRING, description: "The invoice number found on the document" },
            clientName: { type: Type.STRING, description: "The name of the client or company billed" },
            amount: { type: Type.NUMBER, description: "The total amount of the invoice" },
            taxAmount: { type: Type.NUMBER, description: "The total tax amount" },
            date: { type: Type.STRING, description: "The issue date of the invoice in YYYY-MM-DD format" },
            dueDate: { type: Type.STRING, description: "The due date of the invoice in YYYY-MM-DD format" }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("OCR Extraction Error:", error);
    throw new Error("Failed to extract data from the uploaded invoice.");
  }
};