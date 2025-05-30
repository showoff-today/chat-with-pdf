import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from 'dotenv';
dotenv.config();

class GeminiService{
    GeminiEmbeddings = () => {
        return new GoogleGenerativeAIEmbeddings({
              model: "text-embedding-004",
              apiKey: process.env.GOOGLE_API_KEY,
            });
        }
}

export default new GeminiService();